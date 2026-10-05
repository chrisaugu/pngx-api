const { Company } = require("../models");

class CompanyService {
  #company;

  constructor() {
    this.#company = new Company();
  }

  /**
   * Get all companies
   * @returns {Promise<Company[]>}
   */
  async getCompanies() {
    return await Company.find({});
  }

  /**
   * Get company by ID
   * @param {string} id - Company ID
   * @returns {Promise<Company>}
   */
  async getCompanyById(id) {
    return await Company.findById(id);
  }

  /**
   * Get company by code
   * @param {string} code - Company code
   * @returns {Promise<Company>}
   */
  async getCompanyByCode(code) {
    return await Company.findByCode(code);
  }

  /**
   * Create a new company
   * @param {Company} company - Company object
   * @returns {Promise<Company>}
   */
  async createCompany(company) {
    return Company.create(company);
  }

  /**
   * Update an existing company
   * @param {Company} company - Company object
   * @returns {Promise<Company>}
   */
  async updateCompany(company) {
    return await Company.findByIdAndUpdate(company._id, company);
  }

  /**
   * Delete a company
   * @param {Company} company - Company object
   * @returns {Promise<Company>}
   */
  async deleteCompany(company) {
    return await Company.findByIdAndDelete(company._id);
  }
}

module.exports = { CompanyService };
