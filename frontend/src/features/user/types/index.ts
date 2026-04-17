import type { User as DomainUser } from "@shared/domain/user";
import type { ClassMember as DomainClassMember } from "@shared/domain/class";
import type { UserType } from "@shared/domain/enums";
import type { ClassRole } from "@shared/domain/enums";

export type SystemUserType = UserType;

export interface User extends DomainUser {}

export type { ClassRole };

// lớp user cho từng người trong lớp hiện tại
export interface ClassMember extends DomainClassMember {
    // Nếu feature user cần thêm các field UI-only, thêm ở đây
}
