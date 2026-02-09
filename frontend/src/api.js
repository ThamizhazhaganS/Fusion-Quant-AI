import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : 'http://127.0.0.1:8000';

export const getPrediction = async (ticker, volMultiplier = 1.0) => {
    try {
        const response = await axios.get(`${API_URL}/predict/${ticker}?vol_multiplier=${volMultiplier}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching prediction:", error);
        throw error;
    }
};

