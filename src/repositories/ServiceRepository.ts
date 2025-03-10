import { Op } from "sequelize";
import { Service } from "../models/Service";

export class ServiceRepository {
  async getServicesByIdentifier(identifiers: (string | null)[]): Promise<{ identifier_code: string; drive_id: string }[]> {
    try {
      const services = await Service.findAll({
        where: {
          identifier_code: {
            [Op.in]: identifiers,
          },
        },
      });

      return services;
    } catch (error) {
      console.error('Error retrieving services:', error);
      throw error;
    }
  }
}
