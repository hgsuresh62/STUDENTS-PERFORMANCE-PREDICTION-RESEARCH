/* =========================================================
   STUDENT PERFORMANCE AI
   FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById("predictionForm");

const analyzeButton =
    document.getElementById("analyzeButton");

const loadingMessage =
    document.getElementById("loadingMessage");

const resultSection =
    document.getElementById("resultSection");

const predictedPercentage =
    document.getElementById("predictedPercentage");

const circlePercentage =
    document.getElementById("circlePercentage");

const scoreCircle =
    document.getElementById("scoreCircle");

const predictionStatus =
    document.getElementById("predictionStatus");

const performanceLevel =
    document.getElementById("performanceLevel");

const performanceLine =
    document.getElementById("performanceLine");

const predictedG3 =
    document.getElementById("predictedG3");

const finalResult =
    document.getElementById("finalResult");

const resultDescription =
    document.getElementById("resultDescription");

const insightText =
    document.getElementById("insightText");


/* =========================================================
   CHARTS AND REPORT HELPERS
========================================================= */

let gradeProgressChart = null;
let errorMetricsChart = null;
let modelScoreChart = null;
let latestReportData = null;

function renderList(listElement, items, emptyMessage) {
    if (!listElement) return;
    listElement.replaceChildren();
    const safeItems = Array.isArray(items) && items.length ? items : [emptyMessage];
    safeItems.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = String(item);
        listElement.appendChild(li);
    });
}

function initializeEvaluationCharts() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js did not load. Prediction will still work, but charts are unavailable.");
        return;
    }

    const errorCanvas = document.getElementById("errorMetricsChart");
    if (errorCanvas) {
        errorMetricsChart = new Chart(errorCanvas, {
            type: "bar",
            data: {
                labels: ["MAE", "RMSE"],
                datasets: [{
                    label: "Grade-point error",
                    data: [1.139, 1.805],
                    backgroundColor: ["rgba(124, 131, 255, 0.82)", "rgba(75, 196, 180, 0.82)"],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: "Grade points" } }
                }
            }
        });
    }

    const scoreCanvas = document.getElementById("modelScoreChart");
    if (scoreCanvas) {
        modelScoreChart = new Chart(scoreCanvas, {
            type: "bar",
            data: {
                labels: ["R² × 100", "PASS/FAIL accuracy"],
                datasets: [{
                    label: "Reported value (%)",
                    data: [84.1, 87.34],
                    backgroundColor: ["rgba(124, 131, 255, 0.82)", "rgba(75, 196, 180, 0.82)"],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: "Percent scale" } }
                }
            }
        });
    }
}

function updateGradeChart(g1, g2, g3) {
    const note = document.getElementById("gradeChartNote");
    if (typeof Chart === "undefined") {
        if (note) note.textContent = "Chart library unavailable; the prediction result is still shown above.";
        return;
    }
    const canvas = document.getElementById("gradeProgressChart");
    if (!canvas) return;

    if (!gradeProgressChart) {
        gradeProgressChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: ["G1 · Previous", "G2 · Previous", "G3 · Predicted"],
                datasets: [{
                    label: "Grade / 20",
                    data: [g1, g2, g3],
                    backgroundColor: ["rgba(124, 131, 255, 0.82)", "rgba(75, 196, 180, 0.82)", "rgba(244, 177, 93, 0.88)"],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 20, ticks: { stepSize: 5 }, title: { display: true, text: "Grade / 20" } }
                }
            }
        });
    } else {
        gradeProgressChart.data.datasets[0].data = [g1, g2, g3];
        gradeProgressChart.update();
    }
    if (note) note.textContent = `G1: ${g1.toFixed(2)} · G2: ${g2.toFixed(2)} · Predicted G3: ${g3.toFixed(2)} / 20`;
}

function downloadPredictionReport() {
    if (!latestReportData) {
        alert("Please generate a prediction before creating the report.");
        return;
    }
    // Uses the browser's print dialog so the user can choose “Save as PDF”.
    window.print();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeEvaluationCharts();
    const reportButton = document.getElementById("downloadReportButton");
    if (reportButton) reportButton.addEventListener("click", downloadPredictionReport);
});


/* =========================================================
   FORM SUBMISSION
========================================================= */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /* =================================================
           READ INPUTS
        ================================================= */

        const studytime =
            Number(
                document.getElementById("studytime").value
            );


        const failures =
            Number(
                document.getElementById("failures").value
            );


        const absences =
            Number(
                document.getElementById("absences").value
            );


        const traveltime =
            Number(
                document.getElementById("traveltime").value
            );


        const activities =
            document.getElementById("activities").value;


        const health =
            Number(
                document.getElementById("health").value
            );


        const G1 =
            Number(
                document.getElementById("G1").value
            );


        const G2 =
            Number(
                document.getElementById("G2").value
            );


        /* =================================================
           VALIDATION
        ================================================= */

        if (
            !Number.isFinite(studytime) ||
            !Number.isFinite(failures) ||
            !Number.isFinite(absences) ||
            !Number.isFinite(traveltime) ||
            !Number.isFinite(health) ||
            !Number.isFinite(G1) ||
            !Number.isFinite(G2)
        ) {

            alert(
                "Please enter valid values in all fields."
            );

            return;
        }


        if (absences < 0 || absences > 75) {

            alert(
                "Absences must be between 0 and 75."
            );

            return;
        }


        if (G1 < 0 || G1 > 20) {

            alert(
                "G1 must be between 0 and 20."
            );

            return;
        }


        if (G2 < 0 || G2 > 20) {

            alert(
                "G2 must be between 0 and 20."
            );

            return;
        }


        /* =================================================
           CREATE REQUEST OBJECT
        ================================================= */

        const studentData = {

            studytime:
                studytime,

            failures:
                failures,

            absences:
                absences,

            traveltime:
                traveltime,

            activities:
                activities,

            health:
                health,

            G1:
                G1,

            G2:
                G2
        };


        console.log(
            "Student input:",
            studentData
        );


        /* =================================================
           LOADING STATE
        ================================================= */

        analyzeButton.disabled =
            true;


        analyzeButton.innerHTML =
            `
            <span>
                Analyzing Performance...
            </span>

            <span class="button-arrow">
                ◌
            </span>
            `;


        loadingMessage.hidden =
            false;


        try {


            /* =================================================
               SEND REQUEST TO FLASK
            ================================================= */

            latestPredictionInputs = { ...studentData };

            const response =
                await fetch(
                    "/predict",
                    {
                        method:
                            "POST",

                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            },

                        body:
                            JSON.stringify(
                                studentData
                            )
                    }
                );


            /* =================================================
               HANDLE HTTP ERROR
            ================================================= */

            if (!response.ok) {

                let errorMessage =
                    "Prediction request failed.";

                try {

                    const errorData =
                        await response.json();

                    if (
                        errorData.error
                    ) {

                        errorMessage =
                            errorData.error;

                    }

                }

                catch (jsonError) {

                    // No JSON error returned

                }


                throw new Error(
                    errorMessage
                );
            }


            /* =================================================
               READ RESPONSE
            ================================================= */

            const result =
                await response.json();


            console.log(
                "Flask response:",
                result
            );


            /* =================================================
               CHECK RESPONSE
            ================================================= */

            if (
                result.predicted_g3 === undefined ||
                result.score === undefined
            ) {

                throw new Error(
                    "Invalid prediction response from Flask."
                );
            }


            /* =================================================
               CONVERT VALUES
            ================================================= */

            const g3 =
                Number(
                    result.predicted_g3
                );


            const score =
                Number(
                    result.score
                );


            if (
                !Number.isFinite(g3) ||
                !Number.isFinite(score)
            ) {

                throw new Error(
                    "The model returned an invalid prediction."
                );
            }


            /* =================================================
               SAFETY LIMITS
            ================================================= */

            const safeG3 =
                Math.max(
                    0,
                    Math.min(
                        20,
                        g3
                    )
                );


            const safeScore =
                Math.max(
                    0,
                    Math.min(
                        100,
                        score
                    )
                );


            latestReportData = {
                inputs: { studytime, failures, absences, traveltime, activities, health, G1, G2 },
                predicted_g3: safeG3,
                score: safeScore,
                status: safeG3 >= 10 ? "PASS" : "FAIL",
                performance_level: result.performance_level || "",
                recommendation: result.recommendation || "",
                strengths: result.strengths || [],
                areas_to_improve: result.areas_to_improve || []
            };
            updateGradeChart(G1, G2, safeG3);
            const reportInputPanel = document.getElementById("reportInputPanel");
            const reportInputSummary = document.getElementById("reportInputSummary");
            if (reportInputPanel && reportInputSummary) {
                reportInputPanel.hidden = false;
                reportInputSummary.textContent = `Study time: ${studytime}; previous failures: ${failures}; absences: ${absences}; travel time category: ${traveltime}; activities: ${String(activities)}; health rating: ${health}; G1: ${G1.toFixed(2)}/20; G2: ${G2.toFixed(2)}/20.`;
            }
            renderList(document.getElementById("strengthsList"), result.strengths, "Keep building consistent learning habits.");
            renderList(document.getElementById("improvementList"), result.areas_to_improve, "Continue reviewing progress with teachers or mentors.");

            /* =================================================
               STATUS
               G3 >= 10 = PASS
            ================================================= */

            const status =
                safeG3 >= 10
                    ? "PASS"
                    : "FAIL";


            /* =================================================
               PERFORMANCE LEVEL
            ================================================= */

            let calculatedLevel;


            if (safeScore >= 85) {

                calculatedLevel =
                    "Excellent";

            }

            else if (safeScore >= 70) {

                calculatedLevel =
                    "Good";

            }

            else if (safeScore >= 50) {

                calculatedLevel =
                    "Developing";

            }

            else {

                calculatedLevel =
                    "Needs Improvement";

            }


            const level =
                result.performance_level ||
                calculatedLevel;


            /* =================================================
               UPDATE SCORE
            ================================================= */

            predictedPercentage.textContent =
                safeScore.toFixed(2);


            /* =================================================
               UPDATE SCORE RING
            ================================================= */

            circlePercentage.textContent =
                Math.round(
                    safeScore
                );


            scoreCircle.style.setProperty(
                "--score",
                `${safeScore}%`
            );


            /* =================================================
               UPDATE STATUS
            ================================================= */

            predictionStatus.textContent =
                status;


            predictionStatus.classList.remove(
                "pass",
                "fail"
            );


            predictionStatus.classList.add(
                status === "PASS"
                    ? "pass"
                    : "fail"
            );


            /* =================================================
               UPDATE PERFORMANCE LEVEL
            ================================================= */

            performanceLevel.textContent =
                level;


            /* =================================================
               UPDATE PERFORMANCE BAR
            ================================================= */

            performanceLine.style.width =
                `${safeScore}%`;


            /* =================================================
               UPDATE G3
            ================================================= */

            predictedG3.textContent =
                `${safeG3.toFixed(2)} / 20`;


            /* =================================================
               UPDATE FINAL RESULT
            ================================================= */

            finalResult.textContent =
                status;


            if (status === "PASS") {

                finalResult.style.color =
                    "#48dfad";

            }

            else {

                finalResult.style.color =
                    "#ff7181";

            }


            /* =================================================
               RESULT DESCRIPTION
            ================================================= */

            if (status === "PASS") {

                resultDescription.textContent =
                    "The prediction indicates that the student is on track to achieve a passing final grade.";

            }

            else {

                resultDescription.textContent =
                    "The prediction indicates that the student may need additional academic support to improve the predicted final outcome.";

            }


            /* =================================================
               PERSONALIZED INSIGHT
            ================================================= */

            if (result.recommendation) {
                insightText.textContent = result.recommendation;
            } else if (safeScore >= 85) {

                insightText.textContent =
                    "Excellent predicted performance. Maintain the current study routine and continue consistent academic engagement.";

            }

            else if (safeScore >= 70) {

                insightText.textContent =
                    "Good predicted performance. Consistent study habits, attendance and academic engagement can help strengthen the final outcome.";

            }

            else if (safeScore >= 50) {

                insightText.textContent =
                    "The student is currently in the developing range. Improving study consistency and reducing unnecessary absences may improve future performance.";

            }

            else {

                insightText.textContent =
                    "The student may need additional academic support. Focus on study consistency, attendance and addressing previous academic difficulties.";

            }


            /* =================================================
               SHOW RESULT
            ================================================= */

            resultSection.hidden =
                false;


            /* =================================================
               SCROLL TO RESULT
            ================================================= */

            setTimeout(
                function () {

                    resultSection.scrollIntoView(
                        {
                            behavior:
                                "smooth",

                            block:
                                "start"
                        }
                    );

                },
                100
            );


        }


        catch (error) {

            console.error(
                "Prediction error:",
                error
            );


            alert(
                "Unable to generate prediction.\n\n" +
                error.message +
                "\n\nPlease make sure the Flask server is running."
            );

        }


        finally {


            /* =================================================
               RESTORE BUTTON
            ================================================= */

            analyzeButton.disabled =
                false;


            analyzeButton.innerHTML =
                `
                <span>
                    Analyze Performance
                </span>

                <span class="button-arrow">
                    →
                </span>
                `;


            loadingMessage.hidden =
                true;

        }

    }
);


/* =========================================================
   RESET PREDICTION
========================================================= */

function resetPrediction() {

    latestReportData = null;
    renderList(document.getElementById("strengthsList"), [], "Submit a prediction to view strengths.");
    renderList(document.getElementById("improvementList"), [], "Submit a prediction to view suggestions.");
    if (gradeProgressChart) {
        gradeProgressChart.data.datasets[0].data = [0, 0, 0];
        gradeProgressChart.update();
    }
    const chartNote = document.getElementById("gradeChartNote");
    if (chartNote) chartNote.textContent = "Run a prediction to populate this chart.";
    const reportInputPanel = document.getElementById("reportInputPanel");
    if (reportInputPanel) reportInputPanel.hidden = true;

    /* =================================================
       RESET FORM
    ================================================= */

    form.reset();


    /* =================================================
       RESET VALUES
    ================================================= */

    predictedPercentage.textContent =
        "0.00";


    circlePercentage.textContent =
        "0";


    predictedG3.textContent =
        "—";


    finalResult.textContent =
        "—";


    performanceLevel.textContent =
        "—";


    /* =================================================
       RESET SCORE RING
    ================================================= */

    scoreCircle.style.setProperty(
        "--score",
        "0%"
    );


    /* =================================================
       RESET PERFORMANCE BAR
    ================================================= */

    performanceLine.style.width =
        "0%";


    /* =================================================
       RESET STATUS
    ================================================= */

    predictionStatus.textContent =
        "Awaiting prediction";


    predictionStatus.classList.remove(
        "pass",
        "fail"
    );


    /* =================================================
       RESET DESCRIPTION
    ================================================= */

    resultDescription.textContent =
        "Your prediction will appear here.";


    /* =================================================
       RESET INSIGHT
    ================================================= */

    insightText.textContent =
        "Submit a prediction to receive personalized academic insight.";


    /* =================================================
       HIDE RESULT
    ================================================= */

    resultSection.hidden =
        true;


    /* =================================================
       SCROLL BACK TO PROFILE
    ================================================= */

    document
        .getElementById("student-profile")
        .scrollIntoView(
            {
                behavior:
                    "smooth",

                block:
                    "start"
            }
        );

}


/* =========================================================
   KEYBOARD SHORTCUT
   CTRL + ENTER = PREDICT
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            form.requestSubmit();

        }

    }
);

/* =========================================================
   RESEARCH ANALYTICS (independent of the prediction form)
========================================================= */

let featureImportanceChart = null;
let actualPredictedChart = null;
let residualDistributionChart = null;

async function initializeResearchAnalytics() {
    const status = document.getElementById("analyticsStatus");
    const featureCanvas = document.getElementById("featureImportanceChart");
    const scatterCanvas = document.getElementById("actualPredictedChart");
    const residualCanvas = document.getElementById("residualDistributionChart");
    if (!featureCanvas || !scatterCanvas || !residualCanvas) return;
    if (typeof Chart === "undefined") {
        if (status) status.textContent = "Chart library unavailable";
        return;
    }

    try {
        const response = await fetch("/api/analytics");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Analytics request failed");

        const commonScale = {
            grid: { color: "rgba(148, 163, 184, 0.12)" },
            ticks: { color: "#aab7cc", maxRotation: 0 }
        };
        const legend = { labels: { color: "#cbd5e1", usePointStyle: true, boxWidth: 8 } };

        featureImportanceChart = new Chart(featureCanvas, {
            type: "bar",
            data: {
                labels: data.feature_importance.map(item => item.feature),
                datasets: [{
                    label: "Relative importance (%)",
                    data: data.feature_importance.map(item => item.importance),
                    backgroundColor: "rgba(139, 128, 255, 0.82)",
                    borderColor: "#9b91ff",
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: "y", responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(2)}% relative importance` } } },
                scales: { x: { ...commonScale, beginAtZero: true, title: { display: true, text: "Relative importance (%)", color: "#aab7cc" } }, y: { ...commonScale } }
            }
        });

        const scatterPoints = data.actual_vs_predicted.map(item => ({ x: item.actual, y: item.predicted }));
        actualPredictedChart = new Chart(scatterCanvas, {
            type: "scatter",
            data: {
                datasets: [
                    { label: "Held-out test students", data: scatterPoints, backgroundColor: "rgba(65, 205, 177, 0.78)", borderColor: "#41cdb1", pointRadius: 4, pointHoverRadius: 6 },
                    { label: "Perfect prediction", data: [{ x: 0, y: 0 }, { x: 20, y: 20 }], type: "line", showLine: true, pointRadius: 0, borderColor: "#a49aff", borderDash: [6, 5], borderWidth: 2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend, tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 1 ? "Perfect prediction reference" : `Actual: ${ctx.parsed.x.toFixed(2)} · Predicted: ${ctx.parsed.y.toFixed(2)}` } } },
                scales: {
                    x: { ...commonScale, min: 0, max: 20, title: { display: true, text: "Actual G3", color: "#aab7cc" } },
                    y: { ...commonScale, min: 0, max: 20, title: { display: true, text: "Predicted G3", color: "#aab7cc" } }
                }
            }
        });

        residualDistributionChart = new Chart(residualCanvas, {
            type: "bar",
            data: {
                labels: data.residual_distribution.labels,
                datasets: [{ label: "Test students", data: data.residual_distribution.counts, backgroundColor: "rgba(65, 205, 177, 0.78)", borderColor: "#41cdb1", borderWidth: 1, borderRadius: 4 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { title: items => `Residual ${items[0].label}`, label: ctx => `${ctx.parsed.y} test student(s)` } } },
                scales: {
                    x: { ...commonScale, title: { display: true, text: "Residual range (actual − predicted)", color: "#aab7cc" }, ticks: { color: "#aab7cc", maxRotation: 45, minRotation: 30 } },
                    y: { ...commonScale, beginAtZero: true, ticks: { ...commonScale.ticks, precision: 0 }, title: { display: true, text: "Number of students", color: "#aab7cc" } }
                }
            }
        });

        if (status) status.textContent = `Verified test-set analytics · n = ${data.test_size}`;
        const note = document.getElementById("analyticsMethodNote");
        if (note) note.textContent = `Source: ${data.source}. Held-out test set: ${data.test_size} students (20%, random_state = 42). Test-set metrics: MAE ${data.metrics.mae}, RMSE ${data.metrics.rmse}, R² ${data.metrics.r2}, PASS/FAIL accuracy ${data.metrics.pass_fail_accuracy}%.`;
    } catch (error) {
        console.error("Research analytics could not load:", error);
        if (status) status.textContent = "Analytics unavailable — check Flask logs";
        const note = document.getElementById("analyticsMethodNote");
        if (note) note.textContent = "Research charts could not be loaded. The student prediction feature is separate and should continue to work.";
    }
}

document.addEventListener("DOMContentLoaded", initializeResearchAnalytics);


/* =========================================================
   ADDITIVE DATASET EXPLORER, RESIDUAL DIAGNOSTICS, WHAT-IF, SHAP
   Existing /predict handler and its response contract are unchanged.
========================================================= */
let gradeDistributionChart = null;
let studyGradeChart = null;
let residualScatterChart = null;
let latestPredictionInputs = null;
let latestPredictionResult = null;

function currentFormInputs() {
    const get = id => document.getElementById(id);
    return {
        studytime: Number(get("studytime").value),
        failures: Number(get("failures").value),
        absences: Number(get("absences").value),
        traveltime: Number(get("traveltime").value),
        activities: get("activities").value,
        health: Number(get("health").value),
        G1: Number(get("G1").value),
        G2: Number(get("G2").value)
    };
}

async function loadDatasetExplorer() {
    const status = document.getElementById("datasetAnalyticsStatus");
    const heatmap = document.getElementById("correlationHeatmap");
    if (!heatmap) return;
    if (typeof Chart === "undefined") {
        if (status) status.textContent = "Chart library unavailable";
        return;
    }
    try {
        const response = await fetch("/api/dataset-analytics");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Dataset analytics request failed");
        heatmap.replaceChildren();
        const table = document.createElement("table");
        table.className = "heatmap-table";
        const head = document.createElement("tr");
        head.appendChild(document.createElement("th"));
        data.correlation.labels.forEach(label => { const th=document.createElement("th"); th.textContent=label; head.appendChild(th); });
        table.appendChild(head);
        data.correlation.matrix.forEach((row, ri) => {
            const tr=document.createElement("tr"); const label=document.createElement("th"); label.textContent=data.correlation.labels[ri]; tr.appendChild(label);
            row.forEach((value, ci) => { const td=document.createElement("td"); const alpha=Math.min(0.88,0.12+Math.abs(value)*0.72); td.style.backgroundColor=value>=0?`rgba(65,205,177,${alpha})`:`rgba(139,128,255,${alpha})`; td.textContent=value.toFixed(2); td.title=`${data.correlation.labels[ri]} × ${data.correlation.labels[ci]}: ${value.toFixed(3)}`; td.setAttribute("aria-label",td.title); tr.appendChild(td); });
            table.appendChild(tr);
        });
        heatmap.appendChild(table);
        const common = { grid: { color: "rgba(148,163,184,0.12)" }, ticks: { color: "#aab7cc" } };
        const gradeCanvas=document.getElementById("gradeDistributionChart");
        if (gradeCanvas) gradeDistributionChart=new Chart(gradeCanvas,{type:"bar",data:{labels:data.grade_distribution.labels,datasets:[{label:"Students",data:data.grade_distribution.counts,backgroundColor:"rgba(139,128,255,0.82)",borderColor:"#9b91ff",borderWidth:1,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{...common,title:{display:true,text:"Observed G3 grade band",color:"#aab7cc"}},y:{...common,beginAtZero:true,ticks:{color:"#aab7cc",precision:0},title:{display:true,text:"Number of students",color:"#aab7cc"}}}}});
        const studyCanvas=document.getElementById("studyGradeChart");
        if (studyCanvas) studyGradeChart=new Chart(studyCanvas,{type:"bar",data:{labels:data.study_vs_grade.map(x=>x.category),datasets:[{label:"Average observed G3",data:data.study_vs_grade.map(x=>x.average_g3),backgroundColor:"rgba(65,205,177,0.78)",borderColor:"#41cdb1",borderWidth:1,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:ctx=>`Students: ${data.study_vs_grade[ctx.dataIndex].students}`}}},scales:{x:{...common,ticks:{color:"#aab7cc",maxRotation:0}},y:{...common,min:0,max:20,title:{display:true,text:"Average G3 (0–20)",color:"#aab7cc"}}}}});
        if (status) status.textContent=`Dataset analysis loaded · n = ${data.records}`;
    } catch (error) {
        console.error("Dataset explorer failed:", error);
        if (status) status.textContent="Dataset charts unavailable — check Flask logs";
    }
}

async function loadResidualScatter() {
    const canvas=document.getElementById("residualScatterChart");
    if (!canvas || typeof Chart === "undefined") return;
    try {
        const response=await fetch("/api/analytics"); const data=await response.json();
        if(!response.ok) throw new Error(data.error || "Residual data unavailable");
        const points=data.actual_vs_predicted.map(item=>({x:item.predicted,y:item.actual-item.predicted}));
        residualScatterChart=new Chart(canvas,{type:"scatter",data:{datasets:[{label:"Held-out test residuals",data:points,backgroundColor:"rgba(65,205,177,0.78)",borderColor:"#41cdb1",pointRadius:4},{label:"Zero error",data:[{x:0,y:0},{x:20,y:0}],showLine:true,type:"line",pointRadius:0,borderColor:"#a49aff",borderDash:[6,5],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#cbd5e1",usePointStyle:true}},tooltip:{callbacks:{label:ctx=>`Predicted: ${ctx.parsed.x.toFixed(2)} · Residual: ${ctx.parsed.y.toFixed(2)}`}}},scales:{x:{grid:{color:"rgba(148,163,184,0.12)"},ticks:{color:"#aab7cc"},min:0,max:20,title:{display:true,text:"Predicted G3",color:"#aab7cc"}},y:{grid:{color:"rgba(148,163,184,0.12)"},ticks:{color:"#aab7cc"},title:{display:true,text:"Residual (actual − predicted)",color:"#aab7cc"}}}}});
    } catch(error) { console.error("Residual scatter failed:",error); }
}

function copyInputsToWhatIf() {
    try {
        const input=currentFormInputs();
        document.getElementById("whatIfStudytime").value=String(input.studytime);
        document.getElementById("whatIfAbsences").value=String(input.absences);
        document.getElementById("whatIfG1").value=String(input.G1);
        document.getElementById("whatIfG2").value=String(input.G2);
        const status=document.getElementById("whatIfStatus");
        if(status) status.textContent="Copied current form inputs. Run Analyze Performance first to establish the baseline prediction.";
    } catch(error) { console.error("Could not copy current inputs:",error); }
}

async function runWhatIfScenario() {
    const status=document.getElementById("whatIfStatus");
    const results=document.getElementById("whatIfResults");
    try {
        const baselineInputs=currentFormInputs();
        const scenario={...baselineInputs,
            studytime:Number(document.getElementById("whatIfStudytime").value),
            absences:Number(document.getElementById("whatIfAbsences").value),
            G1:Number(document.getElementById("whatIfG1").value),
            G2:Number(document.getElementById("whatIfG2").value)};
        if(!Number.isInteger(scenario.studytime)||scenario.studytime<1||scenario.studytime>4) throw new Error("Study time must be between 1 and 4.");
        if(!Number.isInteger(scenario.absences)||scenario.absences<0||scenario.absences>75) throw new Error("Absences must be between 0 and 75.");
        if(!Number.isFinite(scenario.G1)||scenario.G1<0||scenario.G1>20||!Number.isFinite(scenario.G2)||scenario.G2<0||scenario.G2>20) throw new Error("G1 and G2 must be between 0 and 20.");
        if(status) status.textContent="Calculating both scenarios with the saved model…";
        const post=async payload=>{const r=await fetch("/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Prediction request failed");return d;};
        const [baseline, hypothetical]=await Promise.all([post(baselineInputs),post(scenario)]);
        const diff=Number(hypothetical.predicted_g3)-Number(baseline.predicted_g3);
        document.getElementById("whatIfBaseline").textContent=`${Number(baseline.predicted_g3).toFixed(2)} / 20`;
        document.getElementById("whatIfScenario").textContent=`${Number(hypothetical.predicted_g3).toFixed(2)} / 20`;
        document.getElementById("whatIfDifference").textContent=`${diff>0?"+":""}${diff.toFixed(2)} points`;
        results.hidden=false;
        if(status) status.textContent="Comparison complete. This is a hypothetical model scenario, not a guaranteed real-world outcome.";
    } catch(error) { if(status) status.textContent=error.message || "Scenario could not be calculated."; }
}

async function explainLatestPrediction() {
    const status=document.getElementById("shapStatus"); const container=document.getElementById("shapContributions");
    if(!latestPredictionInputs) { if(status) status.textContent="Run Analyze Performance first, then request an explanation."; return; }
    if(status) status.textContent="Checking SHAP availability and generating explanation…";
    if(container) container.replaceChildren();
    try {
        const response=await fetch("/api/explain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(latestPredictionInputs)});
        const data=await response.json();
        if(!response.ok || !data.available) { if(status) status.textContent=data.message || data.error || "SHAP explanation unavailable."; return; }
        if(status) status.textContent=`SHAP baseline: ${Number(data.baseline).toFixed(3)}. Contributions are in model-output units.`;
        data.contributions.forEach(item=>{const row=document.createElement("div");row.className="shap-row";const name=document.createElement("span");name.textContent=item.feature;const value=document.createElement("strong");value.textContent=`${item.value>0?"+":""}${Number(item.value).toFixed(3)}`;row.append(name,value);container.appendChild(row);});
    } catch(error) { if(status) status.textContent="Could not generate SHAP explanation. Existing predictions are unaffected."; }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDatasetExplorer();
    loadResidualScatter();
    const run=document.getElementById("runWhatIfButton"); if(run) run.addEventListener("click",runWhatIfScenario);
    const copy=document.getElementById("copyCurrentInputsButton"); if(copy) copy.addEventListener("click",copyInputsToWhatIf);
    const explain=document.getElementById("explainPredictionButton"); if(explain) explain.addEventListener("click",explainLatestPrediction);
});
