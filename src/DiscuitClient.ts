import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";

export interface ApiConfig {
	baseURL: string;
}

interface RequestOptions extends AxiosRequestConfig {}

export default class DiscuitClient {
	private axiosInstance: AxiosInstance;
	private csrfToken: string | null = null;
	private sid: string | null = null;

	constructor(config: ApiConfig) {
		this.axiosInstance = axios.create({
			baseURL: config.baseURL,
			withCredentials: true,
		});

		this.axiosInstance.interceptors.response.use(this.handleResponse);
	}

	private handleResponse = (response: AxiosResponse): AxiosResponse => {
		const cookies = response.headers["set-cookie"];
		if (!cookies) return response;

		for (const cookie of cookies) {
			if (cookie.startsWith("csrfToken="))
				this.csrfToken = cookie.split(";")[0].split("=")[1];
			else if (cookie.startsWith("sid="))
				this.sid = cookie.split(";")[0].split("=")[1];
		}

		const headerCsrfToken = response.headers["csrf-token"];
		if (headerCsrfToken) {
			this.csrfToken = headerCsrfToken;
		}

		return response;
	};

	private async request<T>(
		method: string,
		url: string,
		options: RequestOptions = {},
	): Promise<T> {
		// TODO: Catch handle errors
		const headers: RequestOptions["headers"] = {
			...options.headers,
		};

		// Add CSRF token for non-GET requests
		if (method.toUpperCase() !== "GET" && this.csrfToken) {
			headers["X-Csrf-Token"] = this.csrfToken;
		}

		const response = await this.axiosInstance.request<T>({
			method,
			url,
			...options,
			headers,
		});
		return response.data;
	}

	async initialize(): Promise<void> {
		const response = await this.request("GET", "/_initial");
		if (!this.csrfToken || !this.sid) throw new Error("Initialization failed");
	}
}
