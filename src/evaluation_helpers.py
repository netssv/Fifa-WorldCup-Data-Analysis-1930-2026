import math
import numpy as np
from sklearn.metrics import log_loss

def poisson_pmf(lam: float, k: int) -> float:
    return (lam ** k) * math.exp(-lam) / math.factorial(k)


def poisson_match_probs(goals_a: float, goals_b: float, max_goals: int = 8) -> tuple[float, float, float]:
    home_prob = draw_prob = away_prob = 0.0
    lam_a, lam_b = max(0.01, goals_a), max(0.01, goals_b)
    for i in range(max_goals + 1):
        for j in range(max_goals + 1):
            p = poisson_pmf(lam_a, i) * poisson_pmf(lam_b, j)
            if i > j:
                home_prob += p
            elif i == j:
                draw_prob += p
            else:
                away_prob += p
    total = home_prob + draw_prob + away_prob
    return home_prob / total, draw_prob / total, away_prob / total


def to_match_result(y_home: np.ndarray, y_away: np.ndarray) -> np.ndarray:
    result = np.zeros_like(y_home, dtype=int)
    result[y_home < y_away] = 2
    result[y_home == y_away] = 1
    result[y_home > y_away] = 0
    return result


def compute_ece(y_true_onehot: np.ndarray, y_pred: np.ndarray, n_bins: int = 10) -> float:
    total = y_true_onehot.shape[0]
    eces = []
    for col in range(y_true_onehot.shape[1]):
        probs = y_pred[:, col]
        truths = y_true_onehot[:, col]
        bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
        ece = 0.0
        for i in range(n_bins):
            mask = (probs >= bin_edges[i]) & (probs < bin_edges[i + 1])
            if not np.any(mask):
                continue
            avg_pred = probs[mask].mean()
            avg_true = truths[mask].mean()
            ece += np.abs(avg_pred - avg_true) * mask.sum() / total
        eces.append(ece)
    return float(np.mean(eces))


def normalize_probs(probs: np.ndarray) -> np.ndarray:
    clipped = np.clip(probs, 1e-12, 1.0 - 1e-12)
    sums = clipped.sum(axis=1, keepdims=True)
    return clipped / np.maximum(sums, 1e-12)


def evaluate_probability_forecast(
    y_true_home: np.ndarray,
    y_true_away: np.ndarray,
    pred_probs: np.ndarray,
    label: str,
) -> dict[str, float]:
    y_true = to_match_result(y_true_home, y_true_away)
    y_true_onehot = np.zeros((len(y_true), 3), dtype=int)
    y_true_onehot[np.arange(len(y_true)), y_true] = 1
    pred_probs = normalize_probs(pred_probs)
    return {
        f"{label}_brier": float(np.mean(np.sum((pred_probs - y_true_onehot) ** 2, axis=1))),
        f"{label}_log_loss": float(log_loss(y_true, pred_probs, labels=[0, 1, 2])),
        f"{label}_ece": compute_ece(y_true_onehot, pred_probs),
    }
