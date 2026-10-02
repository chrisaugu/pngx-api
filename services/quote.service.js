const { Quote } = require("../models");

class QuoteService {
  #quote;

  constructor() {
    this.#quote = new Quote();
  }

  async getQuotes() {
    return await Quote.find();
  }

  /**
   * getQuoteById
   * @param {Number} id
   * @returns
   */
  async getQuoteById(id) {
    return await Quote.findById(id);
  }

  /**
   * getQuoteByCode
   * @param {String} code
   * @returns
   */
  async getQuoteByCode(code) {
    return await Quote.findByCode(code);
  }

  async createQuote(quote) {
    return await Quote.create(quote);
  }

  async updateQuote(quote) {
    return await Quote.findByIdAndUpdate(quote._id, quote);
  }

  async deleteQuote(quote) {
    return await Quote.findByIdAndDelete(quote._id);
  }
}

module.exports = { QuoteService };
