import { API_BASE_URL } from '$lib/config/api';
import logoDfc from '$lib/assets/logo-dfc.png';

export interface PartnerData {
    logo: string;
    text: string;
    name: string;
    code: string;
}

// Mock partner data
const mockPartners: Record<string, PartnerData> = {
    'DFC': {
        logo: logoDfc,
        text: "You have been given exclusive access to CaseChat by Doctors For A Cause",
        name: "Doctors For A Cause",
        code: "DFC"
    },
    'dfc': {
        logo: logoDfc,
        text: "You have been given exclusive access to CaseChat by Doctors For A Cause",
        name: "Doctors For A Cause",
        code: "dfc"
    }
};

export class PartnerService {
    private baseUrl = API_BASE_URL;

    async getPartnerByCode(code: string): Promise<PartnerData> {
        // Using mock data for now - remove this when real API is ready
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const partner = mockPartners[code] || mockPartners[code.toUpperCase()];
                if (partner) {
                    resolve(partner);
                } else {
                    reject(new Error('Partner not found'));
                }
            }, 500); // Simulate API delay
        });

        // Real API implementation (commented out for now)
        /*
        try {
            const response = await fetch(`${this.baseUrl}/partners/${code}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Partner not found');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching partner data:', error);
            throw error;
        }
        */
    }
}

export const partnerService = new PartnerService(); 