import { ICompany } from "@/types/nuku";
import { Company } from "../models";

class CompanyService {
  private company;

  constructor() {
    this.company = new Company();
  }

  /**
   * Get all companies
   * @returns {Promise<Company[]>}
   */
  async getCompanies(): Promise<ICompany[]> {
    return await Company.find({});
  }

  /**
   * Get company by ID
   * @param {string} id - Company ID
   * @returns {Promise<ICompany>}
   */
  async getCompanyById(id: string): Promise<ICompany> {
    return await Company.findById(id);
  }

  /**
   * Get company by code
   * @param {string} code - Company code
   * @returns {Promise<ICompany>}
   */
  async getCompanyByCode(code: string): Promise<ICompany> {
    return await Company.findByCode(code);
  }

  /**
   * Create a new company
   * @param {ICompany} company - Company object
   * @returns {Promise<ICompany>}
   */
  async createCompany(company: ICompany): Promise<ICompany> {
    return Company.create(company);
  }

  /**
   * Update an existing company
   * @param {ICompany} company - Company object
   * @returns {Promise<ICompany>}
   */
  async updateCompany(company: ICompany): Promise<ICompany> {
    return await Company.findByIdAndUpdate(company._id, company);
  }

  /**
   * Delete a company
   * @param {ICompany} company - Company object
   * @returns {Promise<ICompany>}
   */
  async deleteCompany(company: Company): Promise<ICompany> {
    return await Company.findByIdAndDelete(company._id);
  }
}

export { CompanyService };
