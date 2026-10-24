from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score
import os

app = Flask(__name__)

# ============================================================
# LOAD FINAL TUNED XGBOOST MODEL
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "student_performance_model.pkl"
)

model = joblib.load(MODEL_PATH)


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():
    return render_template("index.html")


# ============================================================
# PREDICTION API
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No input data received."
            }), 400

        # ----------------------------------------------------
        # GET INPUT VALUES
        # ----------------------------------------------------

        studytime = int(data["studytime"])
        failures = int(data["failures"])
        absences = int(data["absences"])
        traveltime = int(data["traveltime"])
        health = int(data["health"])
        G1 = float(data["G1"])
        G2 = float(data["G2"])
        activities = data["activities"]

        # ----------------------------------------------------
        # CONVERT ACTIVITIES
        # ----------------------------------------------------

        if isinstance(activities, str):

            activities = (
                1
                if activities.lower() == "yes"
                else 0
            )

        else:

            activities = int(activities)

        # ----------------------------------------------------
        # BACKEND VALIDATION
        # ----------------------------------------------------

        if studytime not in [1, 2, 3, 4]:

            return jsonify({
                "error": "Study time must be between 1 and 4."
            }), 400

        if failures not in [0, 1, 2, 3]:

            return jsonify({
                "error": "Previous failures must be between 0 and 3."
            }), 400

        if absences < 0 or absences > 75:

            return jsonify({
                "error": "Absences must be between 0 and 75."
            }), 400

        if traveltime not in [1, 2, 3, 4]:

            return jsonify({
                "error": "Travel time must be between 1 and 4."
            }), 400

        if health not in [1, 2, 3, 4, 5]:

            return jsonify({
                "error": "Health status must be between 1 and 5."
            }), 400

        if G1 < 0 or G1 > 20:

            return jsonify({
                "error": "G1 must be between 0 and 20."
            }), 400

        if G2 < 0 or G2 > 20:

            return jsonify({
                "error": "G2 must be between 0 and 20."
            }), 400

        if activities not in [0, 1]:

            return jsonify({
                "error": "Activities must be Yes or No."
            }), 400

        # ----------------------------------------------------
        # CREATE MODEL INPUT
        # ----------------------------------------------------

        input_data = pd.DataFrame({

            "studytime": [studytime],

            "failures": [failures],

            "absences": [absences],

            "traveltime": [traveltime],

            "activities": [activities],

            "health": [health],

            "G1": [G1],

            "G2": [G2]

        })

        # ----------------------------------------------------
        # PREDICT FINAL GRADE
        # ----------------------------------------------------

        predicted_g3 = float(
            model.predict(input_data)[0]
        )

        # Keep G3 within valid range

        predicted_g3 = max(
            0,
            min(20, predicted_g3)
        )

        # ----------------------------------------------------
        # CONVERT TO 100-SCALE
        # ----------------------------------------------------

        predicted_percentage = (
            predicted_g3 / 20
        ) * 100

        # ----------------------------------------------------
        # PASS / FAIL
        # ----------------------------------------------------

        status = (
            "PASS"
            if predicted_g3 >= 10
            else "FAIL"
        )

        # ----------------------------------------------------
        # PERFORMANCE LEVEL
        # ----------------------------------------------------

        if predicted_percentage >= 85:

            performance_level = "Excellent"

        elif predicted_percentage >= 70:

            performance_level = "Good"

        elif predicted_percentage >= 50:

            performance_level = "Developing"

        else:

            performance_level = "Needs Improvement"

        # ====================================================
        # STEP 3 — PREDICTION INSIGHTS
        # ====================================================

        strengths = []
        areas_to_improve = []

        # Study habits

        if studytime >= 3:

            strengths.append(
                "Strong study commitment"
            )

        else:

            areas_to_improve.append(
                "Increase study consistency"
            )

        # Previous failures

        if failures == 0:

            strengths.append(
                "No previous academic failures"
            )

        else:

            areas_to_improve.append(
                "Address previous academic difficulties"
            )

        # Attendance

        if absences <= 5:

            strengths.append(
                "Good attendance"
            )

        elif absences <= 15:

            areas_to_improve.append(
                "Improve attendance consistency"
            )

        else:

            areas_to_improve.append(
                "Reduce excessive absences"
            )

        # Previous grades

        if G1 >= 15 and G2 >= 15:

            strengths.append(
                "Strong previous academic performance"
            )

        elif G1 < 10 or G2 < 10:

            areas_to_improve.append(
                "Improve previous academic grades"
            )

        # Health

        if health >= 4:

            strengths.append(
                "Good health status"
            )

        elif health <= 2:

            areas_to_improve.append(
                "Maintain better health and wellbeing"
            )

        # Activities

        if activities == 1:

            strengths.append(
                "Participates in extracurricular activities"
            )

        # ----------------------------------------------------
        # GENERAL RECOMMENDATION
        # ----------------------------------------------------

        if predicted_percentage >= 85:

            recommendation = (
                "Excellent predicted performance. "
                "Maintain the current study routine "
                "and continue consistent academic engagement."
            )

        elif predicted_percentage >= 70:

            recommendation = (
                "Good predicted performance. "
                "Continue regular study habits and "
                "maintain consistent attendance."
            )

        elif predicted_percentage >= 50:

            recommendation = (
                "The student is developing. "
                "Increasing study consistency and "
                "reducing unnecessary absences may "
                "improve future performance."
            )

        else:

            recommendation = (
                "The student may need additional academic "
                "support. Focus on study consistency, "
                "attendance and previous academic difficulties."
            )

        # ----------------------------------------------------
        # RETURN RESULT
        # ----------------------------------------------------

        return jsonify({

            "predicted_g3": round(
                predicted_g3,
                2
            ),

            "score": round(
                predicted_percentage,
                2
            ),

            "status": status,

            "performance_level":
                performance_level,

            "recommendation":
                recommendation,

            "strengths":
                strengths,

            "areas_to_improve":
                areas_to_improve

        })

    except KeyError as error:

        return jsonify({

            "error":
                f"Missing input field: {error.args[0]}"

        }), 400

    except ValueError:

        return jsonify({

            "error":
                "Please enter valid numeric values."

        }), 400

    except Exception as error:

        print("Prediction error:", error)

        return jsonify({

            "error":
                "An unexpected error occurred while generating the prediction."

        }), 500


# ============================================================
# RESEARCH ANALYTICS API (separate from /predict)
# ============================================================

_analytics_cache = None

@app.route("/api/analytics", methods=["GET"])
def analytics():
    """Return model-derived charts based on the notebook's held-out test split.

    This endpoint does not retrain the model and does not modify /predict.
    The split matches the project notebook: test_size=0.20, random_state=42.
    """
    global _analytics_cache
    if _analytics_cache is not None:
        return jsonify(_analytics_cache)

    try:
        dataset_path = os.path.join(
            os.path.dirname(__file__), "..", "dataset", "student-mat.csv"
        )
        df = pd.read_csv(dataset_path, sep=";")
        feature_names = [
            "studytime", "failures", "absences", "traveltime",
            "activities", "health", "G1", "G2"
        ]
        missing = [name for name in feature_names + ["G3"] if name not in df.columns]
        if missing:
            raise ValueError("Dataset is missing required columns: " + ", ".join(missing))

        X = df[feature_names].copy()
        X["activities"] = X["activities"].map({"yes": 1, "no": 0})
        if X.isnull().any().any() or df["G3"].isnull().any():
            raise ValueError("Dataset contains missing or unmapped feature values.")
        y = df["G3"].astype(float)

        _, X_test, _, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42
        )
        predicted = np.asarray(model.predict(X_test), dtype=float)
        actual = y_test.to_numpy(dtype=float)
        residuals = actual - predicted

        importance = getattr(model, "feature_importances_", None)
        if importance is None or len(importance) != len(feature_names):
            raise ValueError("The loaded model does not expose the expected feature importances.")
        importance = np.asarray(importance, dtype=float)
        total_importance = float(importance.sum())
        if total_importance > 0:
            importance = importance / total_importance * 100

        feature_labels = {
            "studytime": "Study time",
            "failures": "Previous failures",
            "absences": "Absences",
            "traveltime": "Travel time",
            "activities": "Extracurricular activities",
            "health": "Health rating",
            "G1": "G1 · First-period grade",
            "G2": "G2 · Second-period grade"
        }
        ranked = sorted(
            [{"feature": feature_labels[name], "importance": round(float(value), 3)}
             for name, value in zip(feature_names, importance)],
            key=lambda item: item["importance"], reverse=True
        )

        # Histogram bins are computed from the held-out residuals.
        low = float(np.floor(residuals.min()))
        high = float(np.ceil(residuals.max()))
        if high <= low:
            high = low + 1.0
        counts, edges = np.histogram(residuals, bins=10, range=(low, high))
        residual_labels = [
            f"{edges[i]:.1f} to {edges[i + 1]:.1f}"
            for i in range(len(edges) - 1)
        ]

        _analytics_cache = {
            "source": "student-mat.csv",
            "test_size": int(len(X_test)),
            "test_fraction": 0.20,
            "random_state": 42,
            "feature_importance": ranked,
            "actual_vs_predicted": [
                {"actual": round(float(a), 3), "predicted": round(float(p), 3)}
                for a, p in zip(actual, predicted)
            ],
            "residual_distribution": {
                "labels": residual_labels,
                "counts": [int(value) for value in counts],
                "residual_definition": "actual G3 minus predicted G3"
            },
            "metrics": {
                "mae": round(float(mean_absolute_error(actual, predicted)), 3),
                "rmse": round(float(np.sqrt(mean_squared_error(actual, predicted))), 3),
                "r2": round(float(r2_score(actual, predicted)), 3),
                "pass_fail_accuracy": round(float(accuracy_score(actual >= 10, predicted >= 10)) * 100, 2)
            }
        }
        return jsonify(_analytics_cache)
    except Exception as error:
        app.logger.exception("Unable to build research analytics")
        return jsonify({"error": "Analytics data could not be generated. Check the dataset and saved model."}), 500


# ============================================================
# DATASET EXPLORER API (additive; does not alter /predict)
# ============================================================

_dataset_analytics_cache = None

@app.route("/api/dataset-analytics", methods=["GET"])
def dataset_analytics():
    """Dataset-level descriptive charts based on the supplied student-mat.csv."""
    global _dataset_analytics_cache
    if _dataset_analytics_cache is not None:
        return jsonify(_dataset_analytics_cache)
    try:
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "student-mat.csv")
        df = pd.read_csv(dataset_path, sep=";")
        required = ["studytime", "failures", "absences", "traveltime", "activities", "health", "G1", "G2", "G3"]
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise ValueError("Dataset missing required columns: " + ", ".join(missing))

        numeric = df[required].copy()
        numeric["activities"] = numeric["activities"].map({"yes": 1, "no": 0})
        numeric = numeric.apply(pd.to_numeric, errors="coerce")
        numeric = numeric.dropna(subset=required)
        corr_cols = ["studytime", "failures", "absences", "traveltime", "activities", "health", "G1", "G2", "G3"]
        corr_labels = {
            "studytime": "Study time", "failures": "Previous failures", "absences": "Absences",
            "traveltime": "Travel time", "activities": "Activities", "health": "Health",
            "G1": "G1", "G2": "G2", "G3": "G3"
        }
        corr = numeric[corr_cols].corr(method="pearson").fillna(0)
        grade_bins = [0, 5, 10, 15, 20.000001]
        grade_labels = ["0–4", "5–9", "10–14", "15–20"]
        grade_groups = pd.cut(numeric["G3"], bins=grade_bins, labels=grade_labels, right=False, include_lowest=True)
        grade_counts = grade_groups.value_counts(sort=False).reindex(grade_labels, fill_value=0)
        study_labels = {1: "1 · <2 hours", 2: "2 · 2–5 hours", 3: "3 · 5–10 hours", 4: "4 · >10 hours"}
        grouped = numeric.groupby("studytime", observed=False)["G3"].agg(["mean", "count"])
        study_data = [{"category": study_labels.get(int(k), str(k)), "studytime": int(k),
                       "average_g3": round(float(row["mean"]), 3), "students": int(row["count"])}
                      for k, row in grouped.iterrows() if int(k) in study_labels]
        _dataset_analytics_cache = {
            "source": "student-mat.csv", "records": int(len(numeric)),
            "correlation": {"labels": [corr_labels[c] for c in corr_cols],
                            "matrix": [[round(float(v), 3) for v in corr.loc[r, corr_cols].tolist()] for r in corr_cols]},
            "grade_distribution": {"labels": grade_labels, "counts": [int(grade_counts[k]) for k in grade_labels]},
            "study_vs_grade": study_data
        }
        return jsonify(_dataset_analytics_cache)
    except Exception:
        app.logger.exception("Unable to build dataset analytics")
        return jsonify({"error": "Dataset analytics could not be generated. Check dataset/student-mat.csv."}), 500


@app.route("/api/explain", methods=["POST"])
def explain_prediction():
    """Optional SHAP explanation. Returns a clear unavailable response if SHAP is not installed."""
    try:
        try:
            import shap
        except ImportError:
            return jsonify({"available": False, "message": "SHAP is not installed in this environment. Existing predictions and charts are unaffected."}), 200
        data = request.get_json(silent=True) or {}
        feature_names = ["studytime", "failures", "absences", "traveltime", "activities", "health", "G1", "G2"]
        values = {}
        for name in feature_names:
            raw = data.get(name)
            if raw is None:
                return jsonify({"available": False, "message": "Run a prediction first so the explanation can use the current inputs."}), 400
            values[name] = int(raw) if name in ["studytime", "failures", "absences", "traveltime", "activities", "health"] else float(raw)
        row = pd.DataFrame([values], columns=feature_names)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(row)
        arr = np.asarray(shap_values, dtype=float)
        if arr.ndim > 1:
            arr = arr[0]
        base = np.asarray(explainer.expected_value, dtype=float).reshape(-1)
        baseline = float(base[0]) if len(base) else 0.0
        labels = {"studytime":"Study time", "failures":"Previous failures", "absences":"Absences", "traveltime":"Travel time", "activities":"Extracurricular activities", "health":"Health rating", "G1":"G1 previous grade", "G2":"G2 previous grade"}
        contributions = [{"feature": labels[n], "value": round(float(v), 4)} for n, v in zip(feature_names, arr)]
        contributions.sort(key=lambda item: abs(item["value"]), reverse=True)
        return jsonify({"available": True, "baseline": round(baseline, 4), "contributions": contributions})
    except Exception:
        app.logger.exception("SHAP explanation failed")
        return jsonify({"available": False, "message": "SHAP could not explain this model in the current environment. Prediction functionality is unaffected."}), 200


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )