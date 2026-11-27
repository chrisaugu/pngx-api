import { IQuote } from "@/types/nuku";
import { Quote } from "../models";

class QuoteService {
  private quote;

  constructor() {
    this.quote = new Quote();
  }

  async getQuotes() {
    return await Quote.find();
  }

  /**
   * getQuoteById
   * @param {Number} id
   * @returns
   */
  async getQuoteById(id: number) {
    return await Quote.findById(id);
  }

  /**
   * getQuoteByCode
   * @param {String} code
   * @returns
   */
  async getQuoteByCode(code: string) {
    return await Quote.findByCode(code);
  }

  async createQuote(quote: IQuote) {
    return await Quote.create(quote);
  }

  async updateQuote(quote: IQuote) {
    return await Quote.findByIdAndUpdate(quote.id, quote);
  }

  async deleteQuote(quote: IQuote) {
    return await Quote.findByIdAndDelete(quote.id);
  }
}

export default { QuoteService };
