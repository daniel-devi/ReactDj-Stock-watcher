import API from "./API";
import axios from "axios";

/**
 * API configuration constants
 * POLYGON_API_KEY: Authentication key for Polygon.io API
 * POLYGON_BASE_URL: Base URL for Polygon.io tickers endpoint
 */
const POLYGON_API_KEY = "dLepHY8FNSKm91PgFpahLMGbRLEGhboQ";
const POLYGON_BASE_URL = "https://api.polygon.io/v3/reference/tickers";

/**
 * Interface representing a favorite stock in the system
 * @interface FavoriteStock
 * @property {string} stock - The stock symbol/ticker
 */
interface FavoriteStock {
  stock: string;
}

/**
 * Interface representing a search result from Polygon.io API
 * @interface SearchResult
 * @property {string} name - Company name
 * @property {string} ticker - Stock symbol
 * @property {string} market - Market where the stock is traded
 * @property {string} locale - Geographic locale of the stock
 */
interface SearchResult {
  name: string;
  ticker: string;
  market: string;
  locale: string;
}

/**
 * Fetches the list of favorite stocks from the backend and stores them in localStorage
 * @async
 * @function fetchFavorites
 * @returns {Promise<FavoriteStock[]>} Array of favorite stock objects
 * @description Makes an API call to get favorite stocks, processes them through collectTickers,
 *              stores the result in localStorage, and returns the original response data
 */
const fetchFavorites = async (): Promise<FavoriteStock[]> => {
  // Fetch favorite stocks from the API
  const response = await API.get<FavoriteStock[]>("/api/favorite-stocks");
  // Process the response data to collect ticker symbols
  const stockCodes = collectTickers(response.data);
  // Store the processed stock codes in localStorage for future reference
  localStorage.setItem("FavoriteStockCode", JSON.stringify(stockCodes));
  return response.data;
};

export default fetchFavorites;

/**
 * Adds a stock to the favorites list in the backend
 * @async
 * @function addFavoriteStock
 * @param {object} favoriteStockData - Object containing stock information
 * @param {string} favoriteStockData.name - Name of the stock
 * @param {string} favoriteStockData.code - Stock code/symbol
 * @param {string} favoriteStockData.user - User identifier
 * @returns {Promise<void>}
 * @description Creates a new favorite stock entry in the backend database
 */
const addFavoriteStock = async (favoriteStockData: object): Promise<void> => {
  await API.post("/api/favorite-stocks/create", {
    name: favoriteStockData.name,
    code: favoriteStockData.code,
    user: favoriteStockData.user,
  });
collectTickers(favoriteStockData.code)
};

/**
 * Fetches stock search results from Polygon.io API
 * @async
 * @function fetchStockSearchResults
 * @param {string} searchTerm - Search query for finding stocks
 * @returns {Promise<SearchResult[]>} Array of search results
 * @description Queries the Polygon.io API with the provided search term to find matching stocks
 */
const fetchStockSearchResults = async (searchTerm: string) => {
  // Make API request to Polygon.io with search parameters
  const response = await axios.get(`${POLYGON_BASE_URL}`, {
    params: {
      search: searchTerm,
      apiKey: POLYGON_API_KEY,
    },
  });
  return response.data.results;
};

/**
 * Helper function to validate stock symbol format
 * @function isValidStockSymbol
 * @param {string} symbol - Stock symbol to validate
 * @returns {boolean} Whether the symbol is valid
 * @description Validates if a stock symbol matches the format of 1-5 uppercase letters
 */
const isValidStockSymbol = (symbol: string): boolean => {
  return /^[A-Z]{1,5}$/.test(symbol);
};

/**
 * Helper function to format search results
 * @function formatSearchResults
 * @param {SearchResult[]} results - Raw search results
 * @returns {SearchResult[]} Filtered search results containing only US stocks
 * @description Filters the search results to include only stocks from the US market
 */
const formatSearchResults = (results: SearchResult[]): SearchResult[] => {
  return results.filter((result) => result.locale === "us");
};

/**
 * Processes an array of objects to extract ticker symbols
 * @function collectTickers
 * @param {[object]} arr - Array of objects containing ticker information
 * @returns {[]} Array containing processed ticker data
 * @description Maps through the input array and collects ticker symbols into a list
 */
function collectTickers(arr: [object]): [] {
  // Create an empty array to hold the ticker values
  let tickerList = [];

  // Map through the array and collect ticker symbols
  let updatedArr = arr.map((item) => {
    // Add the ticker to the ticker list if it exists
    if (item.ticker) {
      tickerList.push(item.ticker);
    }
    return item;
  });

  return updatedArr;
}

/**
 * Checks if a stock code already exists in favorites
 * @function checkStockCodeAlreadyExists
 * @param {string} stockCode - Stock code to check
 * @returns {boolean} True if stock code exists in favorites, false otherwise
 * @description Retrieves favorite stock codes from localStorage and checks if the given
 *              stock code already exists in the list
 */
function checkStockCodeAlreadyExists(stockCode: string): boolean {
  // Retrieve favorite stock codes from localStorage
  const favoriteStockCodes = localStorage.getItem("FavoriteStockCode");
  // Parse the stored JSON string, defaulting to empty array if none exists
  const jsonData = JSON.parse(favoriteStockCodes || "[]");

  // Check if the stock code exists in the parsed data
  const itemFound = jsonData.some((item) => item.code === stockCode);
  return itemFound;
}

export {
  addFavoriteStock,
  fetchStockSearchResults,
  isValidStockSymbol,
  formatSearchResults,
  collectTickers,
  checkStockCodeAlreadyExists,
};
