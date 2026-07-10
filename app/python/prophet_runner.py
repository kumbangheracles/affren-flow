import sys
import json
import pandas as pd
from prophet import Prophet
import numpy as np


def main():
    try:
        import base64
        input_data = base64.b64decode(sys.argv[1]).decode("utf-8")
        payload = json.loads(input_data)
    except Exception as e:
        print(json.dumps({"status": "error", "error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)

    data            = payload.get("data", [])
    periods         = payload.get("periods", 6)
    training_months = payload.get("training_months")

    if len(data) < 6:
        print(json.dumps({
            "status": "error",
            "error": f"Data historis tidak cukup. Minimal 6 bulan, diterima {len(data)}."
        }))
        sys.exit(1)

    # ── 1. Load dan bersihkan data ────────────────────────────────────────────
    df       = pd.DataFrame(data)
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"]  = df["y"].astype(float)
    df       = df.sort_values("ds").reset_index(drop=True)

    # ── 2. Isi gap bulan yang skip ────────────────────────────────────────────
    full_range = pd.date_range(start=df["ds"].min(), end=df["ds"].max(), freq="MS")
    df         = df.set_index("ds").reindex(full_range).reset_index()
    df.columns = ["ds", "y"]

    # Isi NaN dengan median rolling 3 bulan terdekat
    df["y"] = df["y"].fillna(
        df["y"].rolling(window=3, min_periods=1, center=True).median()
    )
    # Fallback — isi sisa NaN dengan median keseluruhan
    df["y"] = df["y"].fillna(df["y"].median())

    # ── 3. Filter training months ─────────────────────────────────────────────
    if training_months and training_months < len(df):
        df = df.tail(training_months).reset_index(drop=True)

    n_months = len(df)

    # ── 4. Pilih model Prophet sesuai jumlah data ─────────────────────────────
    if n_months > 30:
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.95,
            changepoint_prior_scale=0.1,
            seasonality_prior_scale=5,
            seasonality_mode='multiplicative',
        )
    elif n_months >= 12:
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.95,
            changepoint_prior_scale=0.15,
            seasonality_prior_scale=10,
        )
        model.add_seasonality(name='yearly', period=365.25, fourier_order=2)
    else:
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.95,
            changepoint_prior_scale=0.05,
        )

    # ── 5. Fit dan predict ────────────────────────────────────────────────────
    model.fit(df)

    future   = model.make_future_dataframe(periods=periods, freq="MS")
    forecast = model.predict(future)

    last_actual_date = df["ds"].max()

    result_actual   = []
    result_forecast = []

    for _, row in forecast.iterrows():
        entry = {
            "ds":         row["ds"].strftime("%Y-%m-%d"),
            "yhat":       round(row["yhat"], 2),
            "yhat_lower": round(row["yhat_lower"], 2),
            "yhat_upper": round(row["yhat_upper"], 2),
        }
        if row["ds"] <= last_actual_date:
            result_actual.append(entry)
        else:
            result_forecast.append(entry)

    # ── 6. Metrik akurasi (FIXED) ─────────────────────────────────────────────
    forecast_train = forecast[forecast["ds"].isin(df["ds"])][["ds", "yhat"]]
    merged         = df.merge(forecast_train, on="ds")

    y    = merged["y"].values
    yhat = merged["yhat"].values

    # MAE & RMSE
    mae  = float(np.mean(np.abs(y - yhat)))
    rmse = float(np.sqrt(np.mean((y - yhat) ** 2)))

    # MAPE standar — hitung per titik, skip titik dengan y = 0
    nonzero_mask = y != 0
    if nonzero_mask.sum() > 0:
        mape = float(
            np.mean(
                np.abs((y[nonzero_mask] - yhat[nonzero_mask]) / y[nonzero_mask])
            ) * 100
        )
    else:
        mape = None

    # sMAPE — lebih stabil untuk data dengan nilai sangat variatif
    denom      = np.abs(y) + np.abs(yhat)
    smape_vals = np.where(denom == 0, 0.0, 2 * np.abs(y - yhat) / denom)
    smape      = float(np.mean(smape_vals) * 100)

    # Label akurasi berdasarkan MAPE standar
    if mape is None:
        accuracy_label = "Tidak dapat dihitung"
    elif mape < 10:
        accuracy_label = "Sangat akurat (< 10%)"
    elif mape < 20:
        accuracy_label = "Akurat (< 20%)"
    elif mape < 50:
        accuracy_label = "Cukup akurat (< 50%)"
    else:
        accuracy_label = "Tidak akurat (≥ 50%)"

    # ── 7. Output ─────────────────────────────────────────────────────────────
    print(json.dumps({
        "status":         "success",
        "periods":        periods,
        "trained_on":     n_months,
        "seasonality": (
            "full"   if n_months >= 24 else
            "manual" if n_months >= 12 else
            "none"
        ),
        "mae":            round(mae, 2),
        "rmse":           round(rmse, 2),
        "smape":          round(smape, 2),
        "mape":           round(mape, 2) if mape is not None else None,
        "accuracy_label": accuracy_label,
        "actual":         result_actual,
        "forecast":       result_forecast,
    }))


if __name__ == "__main__":
    main()