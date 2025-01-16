export interface ClassSchedule {
    id: string;
    class_name: string;
    start_time: string | null;
    end_time: string | null;
    max_participants: number;
    color?: string;           // optional
    confirmed_count?: number; 
    class_type_id?: string;
  }
  
  export type WeeklySchedule = {
    [key: string]: ClassSchedule[];
  };
  
  export interface ClassType {
    id: string;
    class_name: string;
    description: string | null;
    color: string;
  };