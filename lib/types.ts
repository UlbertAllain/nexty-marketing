export const LEAD_STATUSES=["NEW","READY_TO_CONTACT","CONTACTED","WAITING_REPLY","REPLIED","QUALIFIED","MEETING","PROPOSAL","NEGOTIATION","DEAL","NOT_INTERESTED","LOST"] as const;
export type LeadStatus=typeof LEAD_STATUSES[number];
export type Potential="LOW"|"MEDIUM"|"HIGH";
export type Lead={id:string;ownerId:string;companyName:string;normalizedCompanyName:string;category:string;contactName:string;phone:string;normalizedPhone:string;email:string;instagram:string;website:string;googleMaps:string;potential:Potential;status:LeadStatus;contactHealth:"READY"|"NEED_CHECK";notes:string;followUpAt:string|null;lastContactAt:string|null;lastReplyAt:string|null;attentionReason:string|null;createdAt:string;updatedAt:string};
export type Template={id:string;ownerId:string;category:string;title:string;content:string;isDefault:boolean;createdAt:string;updatedAt:string};
export type Activity={id:string;ownerId:string;leadId:string;type:"LEAD_CREATED"|"STATUS_CHANGED"|"WHATSAPP_OPENED"|"MESSAGE_SENT"|"FOLLOWUP_CREATED"|"FOLLOWUP_COMPLETED"|"IMPORT";description:string;createdAt:string};
export type Message={id:string;ownerId:string;leadId:string;content:string;direction:"outgoing";status:"DRAFT"|"SENT";createdAt:string;updatedAt:string};
export type FollowUp={id:string;ownerId:string;leadId:string;date:string;reason:string;notes:string;status:"ACTIVE"|"COMPLETED"|"CANCELLED";createdAt:string;updatedAt:string};
