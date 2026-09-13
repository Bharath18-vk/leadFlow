export type TemplateCategory = 'discovery' | 'social_proof' | 'direct' | 'followup' | 'custom';

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  isDefault?: boolean;
  isBuiltIn?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  sampleValue: string;
  description: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: '{{business_name}}',
    label: 'Business Name',
    sampleValue: 'Studio One Interiors',
    description: 'The name of the business / lead',
  },
  {
    key: '{{city}}',
    label: 'City',
    sampleValue: 'Bangalore',
    description: 'The city or locality where the business operates',
  },
  {
    key: '{{category}}',
    label: 'Category',
    sampleValue: 'interior designer',
    description: 'The business category (e.g. interior designer, architect)',
  },
  {
    key: '{{rating}}',
    label: 'Google Rating',
    sampleValue: '4.8',
    description: 'Google Maps star rating (e.g. 4.8)',
  },
  {
    key: '{{reviews}}',
    label: 'Review Count',
    sampleValue: '42',
    description: 'Number of Google Maps reviews',
  },
  {
    key: '{{images}}',
    label: 'Photos Count',
    sampleValue: '35',
    description: 'Number of photos on Google Maps profile',
  },
  {
    key: '{{phone}}',
    label: 'Phone Number',
    sampleValue: '+91 98765 43210',
    description: 'Formatted contact phone number',
  },
  {
    key: '{{neighborhood}}',
    label: 'Neighborhood / Area',
    sampleValue: 'Indiranagar',
    description: 'Local neighborhood or street address',
  },
];
