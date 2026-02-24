import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { getFaculty, getSubjects, initializeAcademicData } from "../utils/academicData";
import { safeParse } from "../utils/storage";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

const SAMPLE_FORMS_KEY = "analysisSampleForms";
const CATEGORY_ORDER = ["academics", "sports", "hostel"];
const CATEGORY_LABELS = {
  academics: "Academics",
  sports: "Sports",
  hostel: "Hostel",
};

const normalizeForms = (rawForms) =>
  Object.entries(rawForms || {}).flatMap(([key, value]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => ({ ...item, __storageKey: key }));
    return [{ ...value, __storageKey: key }];
  });

const average = (numbers) => {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
};

const toDateKey = (timestamp, fallbackIndex) => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return `R${fallbackIndex + 1}`;
  return parsed.toISOString().slice(0, 10);
};

const buildQuestionAnalysis = (question, responses) => {
  const distribution = {};
  const facultyNumeric = {};
  const facultyCounts = {};
  const trendNumeric = {};
  const trendCounts = {};

  responses.forEach((response, index) => {
    const answer = response.answers?.[question.id];
    if (answer === undefined || answer === null || answer === "") return;

    const facultyName = response.contextData?.faculty || "General";
    const dateKey = toDateKey(response.timestamp, index);
    facultyCounts[facultyName] = (facultyCounts[facultyName] || 0) + 1;

    const values = Array.isArray(answer) ? answer : [answer];
    values.forEach((value) => {
      distribution[value] = (distribution[value] || 0) + 1;

      if (typeof value === "number") {
        if (!facultyNumeric[facultyName]) facultyNumeric[facultyName] = [];
        facultyNumeric[facultyName].push(value);
        if (!trendNumeric[dateKey]) trendNumeric[dateKey] = [];
        trendNumeric[dateKey].push(value);
      } else {
        trendCounts[dateKey] = (trendCounts[dateKey] || 0) + 1;
      }
    });
  });

  const hasNumeric = Object.keys(facultyNumeric).length > 0;
  const facultyBreakdown = hasNumeric
    ? Object.entries(facultyNumeric).map(([faculty, values]) => ({
        faculty,
        metric: Number(average(values).toFixed(2)),
        count: values.length,
      }))
    : Object.entries(facultyCounts).map(([faculty, count]) => ({
        faculty,
        metric: count,
        count,
      }));

  const facultyLabels = facultyBreakdown.map((item) => item.faculty);
  const facultyValues = facultyBreakdown.map((item) => item.metric);

  const trendSource = hasNumeric
    ? Object.keys(trendNumeric).reduce((acc, key) => {
        acc[key] = Number(average(trendNumeric[key]).toFixed(2));
        return acc;
      }, {})
    : trendCounts;
  const trendLabels = Object.keys(trendSource).sort();
  const trendValues = trendLabels.map((label) => trendSource[label]);

  const numericValues = Object.values(facultyNumeric).flat();

  return {
    id: question.id,
    text: question.text || "Untitled question",
    type: question.type || "unknown",
    distribution,
    totalAnswers: Object.values(distribution).reduce((a, b) => a + b, 0),
    hasNumeric,
    averageRating: numericValues.length ? Number(average(numericValues).toFixed(2)) : null,
    facultyLabels,
    facultyValues,
    facultyBreakdown,
    trendLabels,
    trendValues,
  };
};

const buildAnalysis = () => {
  const rawForms = safeParse("adminForms", {});
  const sampleForms = safeParse(SAMPLE_FORMS_KEY, []);
  const forms = [...normalizeForms(rawForms), ...sampleForms].filter(
    (form) => CATEGORY_ORDER.includes(form?.category) && Array.isArray(form?.questions)
  );

  const grouped = { academics: [], sports: [], hostel: [] };

  forms.forEach((form) => {
    const responses = Array.isArray(form.responses) ? form.responses : [];
    const questions = (form.questions || []).map((question) => buildQuestionAnalysis(question, responses));
    grouped[form.category].push({
      id: form.id,
      title: form.title || `${CATEGORY_LABELS[form.category]} Form`,
      category: form.category,
      createdAt: form.createdAt || "-",
      totalResponses: responses.length,
      questions,
    });
  });

  const summary = CATEGORY_ORDER.reduce((acc, category) => {
    const formCount = grouped[category].length;
    const responseCount = grouped[category].reduce((sum, form) => sum + form.totalResponses, 0);
    acc[category] = { formCount, responseCount };
    return acc;
  }, {});

  return { grouped, summary };
};

const randomPick = (items) => items[Math.floor(Math.random() * items.length)];

const generateSampleData = () => {
  initializeAcademicData();
  const subjects = getSubjects();
  const faculty = getFaculty();

  const academicsSubjects = subjects.filter((subject) => subject.branch === "CSE" || subject.branch === "ECE");
  const facultyNames = faculty.map((item) => item.name);

  const mkTs = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleString();
  const mkId = () => Date.now() + Math.floor(Math.random() * 100000);

  const academicsFormA = {
    id: mkId(),
    title: "Faculty Teaching Quality Survey",
    category: "academics",
    createdAt: new Date().toLocaleDateString(),
    questions: [
      { id: "a1", text: "How do you rate teaching clarity?", type: "stars" },
      { id: "a2", text: "How useful are the class notes?", type: "radio-5" },
      { id: "a3", text: "How would you rate difficulty level?", type: "slider" },
    ],
    responses: Array.from({ length: 32 }, (_, i) => {
      const subject = randomPick(academicsSubjects);
      return {
        id: mkId(),
        timestamp: mkTs(i % 14),
        submittedBy: `student${i + 1}`,
        category: "academics",
        contextData: {
          year: subject?.year || 2,
          dept: subject?.branch || "CSE",
          subjectId: subject?.id || "",
          course: subject?.name || "DBMS",
          courseCode: subject?.code || "CS301",
          faculty: randomPick(facultyNames) || "Dr. Priya Sharma",
        },
        answers: {
          a1: randomPick([3, 4, 5, 4, 5]),
          a2: randomPick([2, 3, 4, 4, 5]),
          a3: randomPick([4, 5, 6, 7, 8, 9]),
        },
      };
    }),
  };

  const academicsFormB = {
    id: mkId(),
    title: "Course Content & Assessment Survey",
    category: "academics",
    createdAt: new Date().toLocaleDateString(),
    questions: [
      { id: "a5", text: "How relevant is syllabus content?", type: "radio-5" },
      { id: "a6", text: "Rate assessment fairness", type: "stars" },
      {
        id: "a7",
        text: "Preferred evaluation type",
        type: "multiple-choice",
        options: ["Assignments", "Quizzes", "Mid Exam", "Project"],
      },
    ],
    responses: Array.from({ length: 26 }, (_, i) => {
      const subject = randomPick(academicsSubjects);
      return {
        id: mkId(),
        timestamp: mkTs(i % 11),
        submittedBy: `student_a2_${i + 1}`,
        category: "academics",
        contextData: {
          year: subject?.year || 3,
          dept: subject?.branch || "CSE",
          subjectId: subject?.id || "",
          course: subject?.name || "Data Structures",
          courseCode: subject?.code || "CS201",
          faculty: randomPick(facultyNames) || "Dr. Priya Sharma",
        },
        answers: {
          a5: randomPick([2, 3, 4, 4, 5]),
          a6: randomPick([3, 4, 4, 5, 5]),
          a7: randomPick(["Assignments", "Quizzes", "Mid Exam", "Project"]),
        },
      };
    }),
  };

  const sportsFormA = {
    id: mkId(),
    title: "Sports Facilities Survey",
    category: "sports",
    createdAt: new Date().toLocaleDateString(),
    questions: [
      { id: "s1", text: "Rate sports ground quality", type: "stars" },
      { id: "s2", text: "Rate coach support", type: "radio-5" },
      {
        id: "s3",
        text: "Preferred sport",
        type: "multiple-choice",
        options: ["Cricket", "Football", "Basketball", "Badminton"],
      },
    ],
    responses: Array.from({ length: 24 }, (_, i) => ({
      id: mkId(),
      timestamp: mkTs(i % 12),
      submittedBy: `student_s_${i + 1}`,
      category: "sports",
      contextData: { faculty: randomPick(["Coach Rao", "Coach Patel", "Coach Khan"]) },
      answers: {
        s1: randomPick([2, 3, 4, 4, 5]),
        s2: randomPick([2, 3, 3, 4, 5]),
        s3: randomPick(["Cricket", "Football", "Basketball", "Badminton"]),
      },
    })),
  };

  const sportsFormB = {
    id: mkId(),
    title: "Sports Event Participation Survey",
    category: "sports",
    createdAt: new Date().toLocaleDateString(),
    questions: [
      { id: "s4", text: "How likely are you to join events?", type: "slider" },
      {
        id: "s5",
        text: "Which issue limits participation?",
        type: "multiple-choice",
        options: ["Timing", "Equipment", "Coaching", "Ground access"],
      },
      { id: "s6", text: "Rate event management", type: "radio-5" },
    ],
    responses: Array.from({ length: 19 }, (_, i) => ({
      id: mkId(),
      timestamp: mkTs(i % 9),
      submittedBy: `student_s2_${i + 1}`,
      category: "sports",
      contextData: { faculty: randomPick(["Coach Rao", "Coach Patel", "Coach Khan"]) },
      answers: {
        s4: randomPick([3, 4, 5, 6, 7, 8, 9]),
        s5: randomPick(["Timing", "Equipment", "Coaching", "Ground access"]),
        s6: randomPick([2, 3, 4, 4, 5]),
      },
    })),
  };

  const hostelForm = {
    id: mkId(),
    title: "Hostel Life Survey",
    category: "hostel",
    createdAt: new Date().toLocaleDateString(),
    questions: [
      { id: "h1", text: "Rate cleanliness", type: "stars" },
      { id: "h2", text: "Rate food quality", type: "slider" },
      {
        id: "h3",
        text: "Major issue",
        type: "multiple-choice",
        options: ["Water", "Food", "WiFi", "Maintenance"],
      },
    ],
    responses: Array.from({ length: 22 }, (_, i) => ({
      id: mkId(),
      timestamp: mkTs(i % 10),
      submittedBy: `student_h_${i + 1}`,
      category: "hostel",
      contextData: { faculty: randomPick(["Warden A", "Warden B"]) },
      answers: {
        h1: randomPick([2, 3, 3, 4, 4, 5]),
        h2: randomPick([3, 4, 5, 6, 7, 8]),
        h3: randomPick(["Water", "Food", "WiFi", "Maintenance"]),
      },
    })),
  };

  localStorage.setItem(
    SAMPLE_FORMS_KEY,
    JSON.stringify([academicsFormA, academicsFormB, sportsFormA, sportsFormB, hostelForm])
  );
};

function AdminAnalysis() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [activeCategory, setActiveCategory] = useState("academics");
  const [selectedFormId, setSelectedFormId] = useState(null);

  useEffect(() => {
    const existing = safeParse(SAMPLE_FORMS_KEY, []);
    if (!Array.isArray(existing) || existing.length < 5) {
      generateSampleData();
    }
    setRefreshToken((value) => value + 1);
  }, []);

  const analysis = useMemo(() => buildAnalysis(), [refreshToken]);
  const categoryForms = analysis.grouped[activeCategory] || [];

  useEffect(() => {
    if (!categoryForms.length) {
      setSelectedFormId(null);
      return;
    }
    const exists = categoryForms.some((form) => String(form.id) === String(selectedFormId));
    if (!exists) setSelectedFormId(categoryForms[0].id);
  }, [activeCategory, categoryForms, selectedFormId]);

  const selectedForm =
    categoryForms.find((form) => String(form.id) === String(selectedFormId)) || categoryForms[0];

  const facultyBarData = (question) => ({
    labels: question.facultyLabels,
    datasets: [
      {
        label: question.hasNumeric ? "Avg Rating" : "Response Count",
        data: question.facultyValues,
        backgroundColor: "#2575fc",
        borderRadius: 8,
      },
    ],
  });

  const distributionPieData = (question) => ({
    labels: Object.keys(question.distribution),
    datasets: [
      {
        data: Object.values(question.distribution),
        backgroundColor: ["#2575fc", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4", "#795548"],
      },
    ],
  });

  const trendLineData = (question) => ({
    labels: question.trendLabels,
    datasets: [
      {
        label: question.hasNumeric ? "Daily Avg Rating" : "Daily Responses",
        data: question.trendValues,
        borderColor: "#ff9800",
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        tension: 0.35,
        fill: true,
      },
    ],
  });

  const axisLabel = (question) => (question.hasNumeric ? "Rating" : "Responses");
  const barOptions = (question) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { maxRotation: 40, minRotation: 0 } },
      y: {
        beginAtZero: true,
        title: { display: true, text: axisLabel(question) },
      },
    },
  });

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  const lineOptions = (question) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: !question.hasNumeric,
        title: { display: true, text: axisLabel(question) },
      },
    },
  });

  return (
    <div className="analysis-container analysis-v2">
      <div className="analysis-header">
        <h2>Feedback Analysis</h2>
        <p>Select category, then form, then review faculty-wise question insights.</p>
      </div>

      <div className="analysis-category-cards">
        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            className={`analysis-category-card ${activeCategory === category ? "active" : ""}`}
            onClick={() => {
              setActiveCategory(category);
              setSelectedFormId(null);
            }}
          >
            <h3>{CATEGORY_LABELS[category]}</h3>
            <p>Forms: {analysis.summary[category]?.formCount || 0}</p>
            <p>Responses: {analysis.summary[category]?.responseCount || 0}</p>
          </button>
        ))}
      </div>

      <div className="analysis-section">
        <h3>{CATEGORY_LABELS[activeCategory]} Forms</h3>
        {!categoryForms.length ? (
          <div className="empty-state">
            <p>No forms found</p>
            <p>Create forms in this category to view question analytics.</p>
          </div>
        ) : (
          <div className="analysis-form-tabs">
            {categoryForms.map((form) => (
              <button
                key={form.id}
                className={`analysis-form-tab ${selectedForm?.id === form.id ? "active" : ""}`}
                onClick={() => setSelectedFormId(form.id)}
              >
                {form.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedForm && (
        <div className="form-analysis-card">
          <h3>{selectedForm.title}</h3>
          <p>
            Category: <strong>{CATEGORY_LABELS[selectedForm.category]}</strong> | Responses:{" "}
            <strong>{selectedForm.totalResponses}</strong> | Created: <strong>{selectedForm.createdAt}</strong>
          </p>

          <div className="analysis-question-list">
            {selectedForm.questions.map((question) => (
              <div key={question.id} className="question-chart-card">
                <h4>{question.text}</h4>
                <p className="q-meta">
                  Type: {question.type} | Answers: {question.totalAnswers}
                  {question.averageRating !== null ? ` | Avg Rating: ${question.averageRating}` : ""}
                </p>

                <div className="analysis-three-graphs">
                  <div className="analysis-chart-card">
                    <h5>Faculty vs {question.hasNumeric ? "Rating" : "Responses"}</h5>
                    <div className="question-chart">
                      <Bar data={facultyBarData(question)} options={barOptions(question)} />
                    </div>
                  </div>

                  <div className="analysis-chart-card">
                    <h5>Option Distribution</h5>
                    <div className="question-chart">
                      <Pie data={distributionPieData(question)} options={pieOptions} />
                    </div>
                  </div>

                  <div className="analysis-chart-card">
                    <h5>Trend</h5>
                    <div className="question-chart">
                      <Line data={trendLineData(question)} options={lineOptions(question)} />
                    </div>
                  </div>
                </div>

                <div className="analysis-table-wrap">
                  <table className="analysis-table">
                    <thead>
                      <tr>
                        <th>Faculty</th>
                        <th>{question.hasNumeric ? "Avg Rating" : "Responses"}</th>
                        <th>Total Answers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {question.facultyBreakdown.map((item) => (
                        <tr key={`${question.id}-${item.faculty}`}>
                          <td>{item.faculty}</td>
                          <td>{item.metric}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalysis;
