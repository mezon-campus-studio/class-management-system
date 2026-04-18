import { useLeaveInternal } from "./useLeaveInternal";

/**
 * Public Facade Hook cho module Nghỉ phép
 * Theo đúng Guideline: "Các feature khác hoặc component bên ngoài chỉ tương tác qua facade hook"
 */
export const useLeave = useLeaveInternal;
