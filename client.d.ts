/// <reference lib="dom" />
type QueryParams = {[key: string]: unknown}

export interface ClientConfig {
  projectId: string
  dataset: string
  apiVersion?: string
  token?: string
  useCdn?: boolean
  withCredentials?: boolean
  perspective?: string
}

export interface FetchOptions {
  perspective?: string
}

export interface PicoSanity {
  /**
   * Returns the current client configuration
   */
  config(): ClientConfig

  /**
   * Reconfigure the client. Note that this _mutates_ the current client.
   *
   * @param newConfig New client configuration properties
   */
  config(newConfig?: Partial<ClientConfig>): this

  /**
   * @deprecated Use `client.config()` instead
   */
  clientConfig: ClientConfig

  /**
   * Perform a GROQ-query against the configured dataset.
   *
   * @param query GROQ-query to perform
   */
  fetch<R = any>(query: string): Promise<R>

  /**
   * Perform a GROQ-query against the configured dataset.
   *
   * @param query GROQ-query to perform
   * @param params Optional query parameters
   */
  fetch<R = any>(query: string, params: QueryParams): Promise<R>

  /**
   * Perform a GROQ-query against the configured dataset.
   *
   * @param query GROQ-query to perform
   * @param params Optional query parameters
   * @param options Optional fetch options
   */
  fetch<R = any>(query: string, params: QueryParams, options: FetchOptions): Promise<R>

  /**
   * @alpha
   * @deprecated Don't rely on this existing, unless you:
   *   a) Work at Sanity and can ask Espen: "is this a valid use case?"
   *   b) Have a miniature schnauzer named Kokos which makes your life worth living,
   *      AND your name just so happens to be Espen.
   */
  fetcher: (url: string, init: RequestInit) => Promise<Response>
}

/**
 * Create a new client instance with the given configuration.
 */
export function createClient(config: ClientConfig): PicoSanity
