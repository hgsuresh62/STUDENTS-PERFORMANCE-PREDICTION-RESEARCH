# Research Analytics Upgrade — Safe Test Copy

This folder is a separate copy of the uploaded project. The original upload and your existing working folder were not changed.

## Added
- `/api/dataset-analytics`: descriptive dataset data for the correlation heatmap, final-grade distribution, and study-time vs average G3 charts.
- Residuals-vs-predicted chart based on the existing `/api/analytics` held-out test data.
- What-if simulator that submits baseline and scenario inputs to the existing `/predict` endpoint.
- Optional `/api/explain` SHAP endpoint. If SHAP is not installed or incompatible, it returns a graceful message; normal predictions do not depend on it.

## Not changed intentionally
- Existing `/predict` route and its response schema.
- Saved model and dataset.
- Existing prediction UI and existing charts.
- `requirements.txt` (SHAP is not made mandatory).

## Test locally
1. Keep your current project folder as-is.
2. Extract/open this upgrade ZIP in a new folder.
3. Use your working Python 3.12 environment and install requirements only if needed.
4. Start Flask from the new folder with `python app\app.py`.
5. Test `http://127.0.0.1:5000/`, submit a normal prediction, and verify the original charts and PDF/print report.
6. Check `http://127.0.0.1:5000/api/dataset-analytics` returns JSON.
7. Verify dataset charts, residual scatter, and the What-if Lab. SHAP only displays contributions if a compatible SHAP package is already installed.

## Verification performed during packaging
- Python syntax compilation passed for `app/app.py`.
- JavaScript syntax check passed for `app/static/script.js`.
- Dataset file check passed: 395 rows; all required fields present; G3 values span 0–20; studytime categories 1–4 present.
- A full Flask/model integration test was not run in this packaging environment. Run the local checks above before using this version for review or deployment.
