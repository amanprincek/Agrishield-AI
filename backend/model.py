import numpy as np
from sklearn.ensemble import GradientBoostingRegressor


# Feature vector names used for training and prediction
FEATURE_NAMES = [
    "ndvi",
    "temperature",
    "humidity",
    "rainfall",
    "soil_moisture",
]


class CropRiskModel:
    """
    Stable Crop Risk Prediction Model for AgriShield-AI.

    Predicts an overall Crop Risk / Stress Score from 0 to 100
    using five environmental parameters:

    - ndvi: vegetation health index (0.0 to 1.0)
    - temperature: temperature in °C
    - humidity: relative humidity in %
    - rainfall: rainfall / precipitation in mm
    - soil_moisture: soil moisture in %

    IMPORTANT:
    This model is trained on a synthetic agronomic calibration dataset.
    It is NOT a clinical or field-trial disease diagnosis model.

    Lower score  = healthier conditions
    Higher score = greater environmental crop stress/risk
    """

    def __init__(self):
        self.model = None
        self.model_type = "gradient_boosting"
        self._initialize_model()

    # ============================================================
    # SYNTHETIC AGRONOMIC DATASET
    # ============================================================

    def _generate_synthetic_agronomic_dataset(self, n_samples=500):
        """
        Generate a deterministic synthetic dataset based on
        transparent agronomic risk rules.

        Risk increases with:
        1. Low NDVI / vegetation vigor
        2. High humidity + warm temperature
        3. Low soil moisture + high temperature
        4. High soil moisture + heavy rainfall

        Risk decreases under generally optimal crop conditions.
        """

        rng = np.random.default_rng(42)

        # --------------------------------------------------------
        # Environmental features
        # --------------------------------------------------------

        ndvi = rng.uniform(
            0.20,
            0.90,
            n_samples
        )

        temperature = rng.uniform(
            15.0,
            42.0,
            n_samples
        )

        humidity = rng.uniform(
            30.0,
            95.0,
            n_samples
        )

        rainfall = rng.uniform(
            0.0,
            45.0,
            n_samples
        )

        soil_moisture = rng.uniform(
            10.0,
            60.0,
            n_samples
        )

        X = np.column_stack(
            [
                ndvi,
                temperature,
                humidity,
                rainfall,
                soil_moisture,
            ]
        )

        # --------------------------------------------------------
        # Generate synthetic target
        # --------------------------------------------------------

        y = []

        for row in X:

            n_val = row[0]
            t_val = row[1]
            h_val = row[2]
            r_val = row[3]
            sm_val = row[4]

            # Base risk:
            # Lower NDVI means higher vegetation stress.
            risk = (1.0 - n_val) * 45.0

            # ----------------------------------------------------
            # Humidity / fungal environment
            # ----------------------------------------------------

            if h_val > 75 and 20 <= t_val <= 32:
                risk += (h_val - 75) * 0.8

            # ----------------------------------------------------
            # Heat + drought stress
            # ----------------------------------------------------

            if sm_val < 25 and t_val > 32:

                risk += (
                    (25 - sm_val) * 1.2
                    + (t_val - 32) * 1.0
                )

            # ----------------------------------------------------
            # Waterlogging
            # ----------------------------------------------------

            if sm_val > 55 and r_val > 25:
                risk += 15.0

            # ----------------------------------------------------
            # Healthy / optimal conditions
            # ----------------------------------------------------

            if (
                n_val > 0.68
                and 20 <= t_val <= 28
                and 40 <= h_val <= 65
                and 30 <= sm_val <= 50
            ):
                risk -= 15.0

            # ----------------------------------------------------
            # Small deterministic noise
            # ----------------------------------------------------

            risk += rng.normal(
                0,
                3
            )

            risk = np.clip(
                risk,
                5.0,
                95.0
            )

            y.append(risk)

        return X, np.asarray(y)

    # ============================================================
    # MODEL INITIALIZATION
    # ============================================================

    def _initialize_model(self):
        """
        Initialize the ML model.

        XGBoost has intentionally been removed from the runtime
        prediction path because native XGBoost training was causing
        a Windows/Python 3.13 process-level access violation.

        GradientBoostingRegressor is stable for this prototype and
        keeps the same five-feature prediction interface.
        """

        try:

            X, y = self._generate_synthetic_agronomic_dataset(
                n_samples=500
            )

            self.model = GradientBoostingRegressor(
                n_estimators=80,
                learning_rate=0.06,
                max_depth=3,
                random_state=42,
                loss="squared_error",
            )

            self.model.fit(
                X,
                y
            )

            self.model_type = "gradient_boosting"

            print(
                "[ML Engine] Gradient Boosting Crop Risk Model "
                "trained successfully."
            )

        except Exception as e:

            print(
                "[ML Engine] Gradient Boosting initialization failed:"
            )

            print(
                repr(e)
            )

            print(
                "[ML Engine] Using analytical agronomic formula."
            )

            self.model = None
            self.model_type = "agronomic_formula"

    # ============================================================
    # ANALYTICAL FALLBACK
    # ============================================================

    def _calculate_formula_risk(
        self,
        ndvi: float,
        temperature: float,
        humidity: float,
        rainfall: float,
        soil_moisture: float,
    ) -> float:
        """
        Deterministic agronomic formula used if the ML model
        cannot be initialized.
        """

        # Base vegetation stress
        risk = (1.0 - ndvi) * 45.0

        # High humidity + warm temperature
        if humidity > 75 and 20 <= temperature <= 32:

            risk += (
                (humidity - 75) * 0.8
            )

        # Heat + drought
        if soil_moisture < 25 and temperature > 32:

            risk += (
                (25 - soil_moisture) * 1.2
                + (temperature - 32)
            )

        # Waterlogging
        if soil_moisture > 55 and rainfall > 25:

            risk += 15.0

        # Healthy conditions
        if (
            ndvi > 0.68
            and 20 <= temperature <= 28
            and 40 <= humidity <= 65
            and 30 <= soil_moisture <= 50
        ):

            risk -= 15.0

        return risk

    # ============================================================
    # PREDICTION
    # ============================================================

    def predict_risk_score(
        self,
        ndvi: float,
        temperature: float,
        humidity: float,
        rainfall: float,
        soil_moisture: float,
    ) -> int:
        """
        Predict Crop Risk Score from 0 to 100.

        The public method signature is intentionally unchanged so
        backend.prediction.py does not need modification.
        """

        # --------------------------------------------------------
        # Basic input safety
        # --------------------------------------------------------

        values = [
            ndvi,
            temperature,
            humidity,
            rainfall,
            soil_moisture,
        ]

        try:

            values = [
                float(value)
                for value in values
            ]

        except (TypeError, ValueError):

            raise ValueError(
                "Environmental parameters must be numeric."
            )

        ndvi, temperature, humidity, rainfall, soil_moisture = values

        # --------------------------------------------------------
        # Keep values within sensible prototype ranges
        # --------------------------------------------------------

        ndvi = float(
            np.clip(
                ndvi,
                0.0,
                1.0
            )
        )

        temperature = float(
            np.clip(
                temperature,
                -10.0,
                60.0
            )
        )

        humidity = float(
            np.clip(
                humidity,
                0.0,
                100.0
            )
        )

        rainfall = float(
            max(
                rainfall,
                0.0
            )
        )

        soil_moisture = float(
            np.clip(
                soil_moisture,
                0.0,
                100.0
            )
        )

        # --------------------------------------------------------
        # ML prediction
        # --------------------------------------------------------

        if self.model is not None:

            features = np.array(
                [[
                    ndvi,
                    temperature,
                    humidity,
                    rainfall,
                    soil_moisture,
                ]],
                dtype=float,
            )

            raw_prediction = float(
                self.model.predict(
                    features
                )[0]
            )

        # --------------------------------------------------------
        # Formula fallback
        # --------------------------------------------------------

        else:

            raw_prediction = self._calculate_formula_risk(
                ndvi=ndvi,
                temperature=temperature,
                humidity=humidity,
                rainfall=rainfall,
                soil_moisture=soil_moisture,
            )

        # --------------------------------------------------------
        # Final 0–100 score
        # --------------------------------------------------------

        score = int(
            round(
                np.clip(
                    raw_prediction,
                    0.0,
                    100.0,
                )
            )
        )

        return score


# ============================================================
# GLOBAL SINGLETON
# ============================================================

# This object is created when backend.model is imported.
# It is now safe because it uses sklearn instead of XGBoost.

risk_model = CropRiskModel()