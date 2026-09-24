const API_BASE = "https://dev.ipn.ge";

export interface CurrencyDataset {
  data: string[];
  label: string;
}

export interface CurrencyResponse {
  dataset: CurrencyDataset[];
  labels: string[];
}

export async function getRates(
  langCode: string
): Promise<CurrencyResponse> {
  const response = await fetch(
    `${API_BASE}/${langCode}/api/rates/`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      body: "",
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data: CurrencyResponse = await response.json();

  return data;
}