-- ==============================================================
-- Source: V1__init_auth.sql
-- ==============================================================
-- Auth: users & refresh_tokens

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      VARCHAR(500),
    user_type       VARCHAR(20)  NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    token       VARCHAR(128) NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    family_id   UUID         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    used_at     TIMESTAMPTZ,
    revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_rt_token  ON refresh_tokens (token);
CREATE INDEX idx_rt_user   ON refresh_tokens (user_id);
CREATE INDEX idx_rt_family ON refresh_tokens (family_id);

-- ==============================================================
-- Source: V2__init_classroom_group.sql
-- ==============================================================
-- Classrooms, members, groups, group members

CREATE TABLE classrooms (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL,
    description             VARCHAR(1000),
    cover_image_url         VARCHAR(500),
    invite_code             VARCHAR(12)  NOT NULL UNIQUE,
    invite_code_expires_at  TIMESTAMPTZ,
    owner_id                UUID         NOT NULL REFERENCES users (id),
    max_members             INT          NOT NULL DEFAULT 100,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classrooms_owner ON classrooms (owner_id);

CREATE TABLE classroom_members (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    role         VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_classroom_member UNIQUE (classroom_id, user_id)
);

CREATE INDEX idx_cm_classroom ON classroom_members (classroom_id);
CREATE INDEX idx_cm_user      ON classroom_members (user_id);

CREATE TABLE groups (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    description  VARCHAR(500),
    color        VARCHAR(20),
    leader_id    UUID        REFERENCES users (id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_classroom ON groups (classroom_id);

CREATE TABLE group_members (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id            UUID        NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    classroom_member_id UUID        NOT NULL REFERENCES classroom_members (id) ON DELETE CASCADE,
    user_id             UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_group_member UNIQUE (group_id, classroom_member_id)
);

CREATE INDEX idx_gm_group ON group_members (group_id);
CREATE INDEX idx_gm_user  ON group_members (user_id);

-- ==============================================================
-- Source: V3__init_attendance.sql
-- ==============================================================
-- Attendance sessions & records

CREATE TABLE attendance_sessions (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    created_by   UUID        NOT NULL REFERENCES users (id),
    title        VARCHAR(255) NOT NULL,
    description  VARCHAR(1000),
    status       VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    closes_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_as_classroom ON attendance_sessions (classroom_id);

CREATE TABLE attendance_records (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   UUID        NOT NULL REFERENCES attendance_sessions (id) ON DELETE CASCADE,
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status       VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    note         VARCHAR(500),
    reviewed_by  UUID        REFERENCES users (id),
    reviewed_at  TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_record UNIQUE (session_id, user_id)
);

CREATE INDEX idx_ar_session  ON attendance_records (session_id);
CREATE INDEX idx_ar_classroom ON attendance_records (classroom_id);

-- ==============================================================
-- Source: V4__init_emulation.sql
-- ==============================================================
-- Điểm thi đua

CREATE TABLE emulation_categories (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id  UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL,
    description   VARCHAR(500),
    default_score INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ec_classroom ON emulation_categories (classroom_id);

CREATE TABLE emulation_entries (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id    UUID        NOT NULL REFERENCES emulation_categories (id) ON DELETE CASCADE,
    classroom_id   UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    member_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    score          INT         NOT NULL,
    note           VARCHAR(500),
    recorded_by_id UUID        NOT NULL REFERENCES users (id),
    occurred_at    TIMESTAMPTZ NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ee_classroom ON emulation_entries (classroom_id);
CREATE INDEX idx_ee_member    ON emulation_entries (member_id);

-- ==============================================================
-- Source: V5__init_duty.sql
-- ==============================================================
-- Trực nhật

CREATE TABLE duty_types (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    name         VARCHAR(200) NOT NULL,
    description  VARCHAR(500),
    active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dt_classroom ON duty_types (classroom_id);

CREATE TABLE duty_assignments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    duty_type_id    UUID        NOT NULL REFERENCES duty_types (id) ON DELETE CASCADE,
    classroom_id    UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    assigned_to_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    duty_date       DATE        NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note            VARCHAR(500),
    confirmed_by_id UUID        REFERENCES users (id),
    confirmed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_da_classroom ON duty_assignments (classroom_id);
CREATE INDEX idx_da_assigned  ON duty_assignments (assigned_to_id);
CREATE INDEX idx_da_date      ON duty_assignments (classroom_id, duty_date);

-- ==============================================================
-- Source: V6__init_document.sql
-- ==============================================================
-- Tài liệu & thư mục

CREATE TABLE folders (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id   UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    name           VARCHAR(200) NOT NULL,
    parent_id      UUID        REFERENCES folders (id) ON DELETE CASCADE,
    created_by_id  UUID        NOT NULL REFERENCES users (id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_folders_classroom ON folders (classroom_id);
CREATE INDEX idx_folders_parent    ON folders (parent_id);

CREATE TABLE documents (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id   UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    folder_id      UUID        REFERENCES folders (id) ON DELETE SET NULL,
    name           VARCHAR(300) NOT NULL,
    file_path      VARCHAR(500) NOT NULL,
    content_type   VARCHAR(100),
    file_size      BIGINT,
    uploaded_by_id UUID        NOT NULL REFERENCES users (id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_classroom ON documents (classroom_id);
CREATE INDEX idx_documents_folder    ON documents (folder_id);

-- ==============================================================
-- Source: V7__init_fund.sql
-- ==============================================================
-- Quỹ lớp

CREATE TABLE funds (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL UNIQUE REFERENCES classrooms (id) ON DELETE CASCADE,
    name         VARCHAR(200) NOT NULL,
    description  VARCHAR(500),
    balance      NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fund_collections (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id      UUID          NOT NULL REFERENCES funds (id) ON DELETE CASCADE,
    classroom_id UUID          NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    title        VARCHAR(200)  NOT NULL,
    amount       NUMERIC(15,2) NOT NULL,
    description  VARCHAR(500),
    due_date     DATE,
    active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fc_classroom ON fund_collections (classroom_id);
CREATE INDEX idx_fc_fund      ON fund_collections (fund_id);

CREATE TABLE fund_payments (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id    UUID          NOT NULL REFERENCES fund_collections (id) ON DELETE CASCADE,
    classroom_id     UUID          NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    member_id        UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amount           NUMERIC(15,2) NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    note             VARCHAR(500),
    confirmed_by_id  UUID          REFERENCES users (id),
    confirmed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fp_collection ON fund_payments (collection_id);
CREATE INDEX idx_fp_member     ON fund_payments (classroom_id, member_id);

CREATE TABLE fund_expenses (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id        UUID          NOT NULL REFERENCES funds (id) ON DELETE CASCADE,
    classroom_id   UUID          NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    title          VARCHAR(200)  NOT NULL,
    amount         NUMERIC(15,2) NOT NULL,
    description    VARCHAR(500),
    recorded_by_id UUID          NOT NULL REFERENCES users (id),
    expense_date   TIMESTAMPTZ   NOT NULL,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fe_classroom ON fund_expenses (classroom_id);

-- ==============================================================
-- Source: V8__init_event.sql
-- ==============================================================
-- Sự kiện, RSVP, đơn xin vắng, bình chọn

CREATE TABLE events (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id   UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    description    VARCHAR(2000),
    start_time     TIMESTAMPTZ NOT NULL,
    end_time       TIMESTAMPTZ,
    location       VARCHAR(300),
    mandatory      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_by_id  UUID        NOT NULL REFERENCES users (id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_classroom ON events (classroom_id);
CREATE INDEX idx_events_time      ON events (classroom_id, start_time);

CREATE TABLE event_rsvps (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id  UUID        NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    user_id   UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    response  VARCHAR(20) NOT NULL,
    note      VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_rsvp UNIQUE (event_id, user_id)
);

CREATE INDEX idx_rsvp_event ON event_rsvps (event_id);

CREATE TABLE absence_requests (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    event_id     UUID        REFERENCES events (id) ON DELETE SET NULL,
    reason       VARCHAR(1000) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by_id UUID      REFERENCES users (id),
    review_note  VARCHAR(500),
    reviewed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_absence_classroom ON absence_requests (classroom_id);
CREATE INDEX idx_absence_user      ON absence_requests (user_id);

CREATE TABLE polls (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id   UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    question       VARCHAR(500) NOT NULL,
    multi_choice   BOOLEAN     NOT NULL DEFAULT FALSE,
    anonymous      BOOLEAN     NOT NULL DEFAULT FALSE,
    closes_at      TIMESTAMPTZ,
    created_by_id  UUID        NOT NULL REFERENCES users (id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_polls_classroom ON polls (classroom_id);

CREATE TABLE poll_options (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id    UUID        NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
    text       VARCHAR(300) NOT NULL,
    sort_order INT         NOT NULL DEFAULT 0
);

CREATE INDEX idx_po_poll ON poll_options (poll_id);

CREATE TABLE poll_votes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id    UUID        NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
    option_id  UUID        NOT NULL REFERENCES poll_options (id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_poll_vote UNIQUE (poll_id, option_id, user_id)
);

CREATE INDEX idx_pv_poll ON poll_votes (poll_id);

-- ==============================================================
-- Source: V9__init_chat.sql
-- ==============================================================
-- Chat & hội thoại

CREATE TABLE conversations (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    type         VARCHAR(20) NOT NULL,
    name         VARCHAR(200),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conv_classroom ON conversations (classroom_id);

CREATE TABLE messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID        NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_id       UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content         TEXT        NOT NULL,
    reply_to_id     UUID        REFERENCES messages (id) ON DELETE SET NULL,
    deleted         BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);

-- ==============================================================
-- Source: V10__init_notification.sql
-- ==============================================================
-- Thông báo

CREATE TABLE notifications (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    classroom_id UUID        REFERENCES classrooms (id) ON DELETE CASCADE,
    type         VARCHAR(50) NOT NULL,
    title        VARCHAR(500) NOT NULL,
    body         VARCHAR(1000),
    reference_id UUID,
    read         BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications (user_id, created_at);

-- ==============================================================
-- Source: V11__init_admin_and_parent_link.sql
-- ==============================================================
-- Add student_code column to users (nullable, unique when present)
ALTER TABLE users ADD COLUMN student_code VARCHAR(16);
CREATE UNIQUE INDEX idx_users_student_code ON users (student_code);

-- Backfill student_code for existing STUDENT users (random 6-char suffix)
UPDATE users
SET student_code = 'STU-' || UPPER(SUBSTRING(MD5(id::text || RANDOM()::text) FROM 1 FOR 6))
WHERE user_type = 'STUDENT';

-- Parent ↔ Student linking table
CREATE TABLE parent_links (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    relationship VARCHAR(20),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parent_links_parent  ON parent_links (parent_id);
CREATE INDEX idx_parent_links_student ON parent_links (student_id);
CREATE UNIQUE INDEX uq_parent_links_pair ON parent_links (parent_id, student_id);

-- Default system admin được seed bởi AdminBootstrap component lúc app start lần đầu.

-- ==============================================================
-- Source: V12__init_seating_and_chat_attachments.sql
-- ==============================================================
-- ─── Seating Chart ─────────────────────────────────────────────────────────
-- One layout per classroom. `layout_json` holds the seat assignments:
--   { "rows": 6, "seatsPerSide": 2, "sides": 2,
--     "assignments": { "1L1": "<userId>", "1L2": "<userId>", "1R1": "<userId>" ... } }
-- seatKey format: "<rowIndex><L|R><seatIndex>" (row 1..N, side L/R, seat 1..seatsPerSide)
CREATE TABLE seating_charts (
    classroom_id    UUID PRIMARY KEY REFERENCES classrooms(id) ON DELETE CASCADE,
    rows_count      INT  NOT NULL DEFAULT 6,
    seats_per_side  INT  NOT NULL DEFAULT 2,
    layout_json     TEXT NOT NULL DEFAULT '{}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Chat attachments + plugin payload ─────────────────────────────────────
ALTER TABLE messages
    ADD COLUMN message_type     VARCHAR(20)  NOT NULL DEFAULT 'TEXT',
    ADD COLUMN attachment_url   VARCHAR(500),
    ADD COLUMN attachment_name  VARCHAR(255),
    ADD COLUMN attachment_type  VARCHAR(100),
    ADD COLUMN attachment_size  BIGINT,
    ADD COLUMN payload_json     TEXT;

-- Allow message content to be empty for attachment-only / plugin messages
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

-- ==============================================================
-- Source: V13__init_chat_reactions_and_pin.sql
-- ==============================================================
-- ─── Pin support on messages ───────────────────────────────────────────────
ALTER TABLE messages
    ADD COLUMN pinned     BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN pinned_at  TIMESTAMPTZ,
    ADD COLUMN pinned_by  UUID;

CREATE INDEX idx_messages_pinned
    ON messages (conversation_id, pinned)
    WHERE pinned = TRUE;

-- ─── Reactions ─────────────────────────────────────────────────────────────
-- One row per (message, user, emoji). Composite PK so a user can react with
-- multiple distinct emojis but cannot duplicate the same emoji on same message.
CREATE TABLE message_reactions (
    message_id  UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    emoji       VARCHAR(16) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id, emoji)
);

CREATE INDEX idx_reactions_message ON message_reactions (message_id);

-- ==============================================================
-- Source: V14__refresh_token_use_count_and_evaluation.sql
-- ==============================================================
-- V14: add use_count to refresh_tokens + student_evaluations table

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS use_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS student_evaluations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id    UUID        NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id      UUID        NOT NULL REFERENCES users(id),
    category        VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    score           INT         CHECK (score BETWEEN 0 AND 10),
    title           VARCHAR(200),
    content         TEXT        NOT NULL,
    period          VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_classroom ON student_evaluations (classroom_id);
CREATE INDEX IF NOT EXISTS idx_eval_student   ON student_evaluations (student_id);
CREATE INDEX IF NOT EXISTS idx_eval_teacher   ON student_evaluations (teacher_id);

-- ==============================================================
-- Source: V15__absence_request_date_and_parent.sql
-- ==============================================================
-- Add date and note columns for general absence requests (not tied to a specific event)
ALTER TABLE absence_requests
    ADD COLUMN IF NOT EXISTS absence_date DATE,
    ADD COLUMN IF NOT EXISTS note VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS submitted_by_parent_id UUID REFERENCES users (id);

-- ==============================================================
-- Source: V16__refresh_token_client_binding.sql
-- ==============================================================
-- Client-binding: SHA-256 hash of the clientId stored in browser localStorage.
-- Even if refresh cookie is stolen, attacker cannot refresh without the clientId.
ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS client_id_hash VARCHAR(64);

-- ==============================================================
-- Source: V17__password_reset_tokens.sql
-- ==============================================================
CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255)        NOT NULL,
    otp_hash    VARCHAR(64)         NOT NULL,
    expires_at  TIMESTAMPTZ         NOT NULL,
    used        BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT now()
);

CREATE INDEX idx_prt_email ON password_reset_tokens (email);

-- ==============================================================
-- Source: V18__attendance_simplify.sql
-- ==============================================================
-- Simplify attendance to teacher-managed roll call model.
-- Students no longer self-check-in; teacher marks each student directly.
-- Remove PENDING_APPROVAL and REJECTED states → both become ABSENT.

UPDATE attendance_records
SET status = 'ABSENT'
WHERE status IN ('PENDING_APPROVAL', 'REJECTED');

-- ==============================================================
-- Source: V19__init_conversation_settings.sql
-- ==============================================================
CREATE TABLE conversation_settings (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL,
    conversation_id UUID NOT NULL,
    bubble_color    VARCHAR(100),
    wallpaper       VARCHAR(500),
    updated_at      TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_conv_settings UNIQUE (user_id, conversation_id)
);

-- ==============================================================
-- Source: V20__notification_preferences.sql
-- ==============================================================
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    chat_level VARCHAR(20) NOT NULL DEFAULT 'ALL',
    duty_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    event_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    attendance_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    fund_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    evaluation_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE UNIQUE INDEX uq_notif_pref_global ON notification_preferences (user_id) WHERE classroom_id IS NULL;
CREATE UNIQUE INDEX uq_notif_pref_classroom ON notification_preferences (user_id, classroom_id) WHERE classroom_id IS NOT NULL;

-- ==============================================================
-- Source: V21__init_timetable.sql
-- ==============================================================
CREATE TABLE subjects (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL,
    periods_per_week INT         NOT NULL DEFAULT 1,
    color_hex       VARCHAR(7)   NOT NULL DEFAULT '#C2714F',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_subjects_code ON subjects (code);

CREATE TABLE teacher_subjects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id  UUID NOT NULL,
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT uq_teacher_subject UNIQUE (teacher_id, subject_id)
);
CREATE INDEX idx_teacher_subjects_teacher ON teacher_subjects (teacher_id);

CREATE TABLE timetable_entries (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id    UUID        NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id      UUID        NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id      UUID,
    day_of_week     VARCHAR(10) NOT NULL,
    period          INT         NOT NULL,
    academic_year   VARCHAR(9)  NOT NULL,
    semester        INT         NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_timetable_classroom_slot UNIQUE (classroom_id, day_of_week, period, academic_year, semester),
    CONSTRAINT uq_timetable_teacher_slot   UNIQUE (teacher_id, day_of_week, period, academic_year, semester)
);
CREATE INDEX idx_timetable_classroom ON timetable_entries (classroom_id, academic_year, semester);
CREATE INDEX idx_timetable_teacher   ON timetable_entries (teacher_id, academic_year, semester);

CREATE TABLE swap_requests (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id        UUID        NOT NULL,
    requester_entry_id  UUID        NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
    target_teacher_id   UUID        NOT NULL,
    target_entry_id     UUID        REFERENCES timetable_entries(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason              TEXT,
    reviewed_by_id      UUID,
    review_note         TEXT,
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_swap_requester ON swap_requests (requester_id);
CREATE INDEX idx_swap_target    ON swap_requests (target_teacher_id);

-- ==============================================================
-- Source: V22__classroom_subject_configs.sql
-- ==============================================================
CREATE TABLE classroom_subject_configs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id    UUID        NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id      UUID        NOT NULL REFERENCES subjects(id)   ON DELETE CASCADE,
    teacher_id      UUID,
    periods_per_week INT        NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_classroom_subject_config UNIQUE (classroom_id, subject_id)
);

CREATE INDEX idx_csc_classroom ON classroom_subject_configs (classroom_id);
CREATE INDEX idx_csc_subject   ON classroom_subject_configs (subject_id);
CREATE INDEX idx_csc_teacher   ON classroom_subject_configs (teacher_id);

-- ==============================================================
-- Source: V23__classroom_member_roles_and_permissions.sql
-- ==============================================================
-- Multi-role support: a member can hold multiple secondary roles
-- (e.g. lớp phó học tập, sao đỏ, tổ trưởng) on top of their primary role.
CREATE TABLE classroom_member_extra_roles (
    member_id UUID        NOT NULL REFERENCES classroom_members (id) ON DELETE CASCADE,
    role      VARCHAR(40) NOT NULL,
    PRIMARY KEY (member_id, role)
);

CREATE INDEX idx_cm_extra_roles_member ON classroom_member_extra_roles (member_id);

-- Fine-grained delegated permissions a teacher can grant to a student
-- (independent of role) – e.g. "MANAGE_EMULATION_CATEGORIES".
CREATE TABLE classroom_member_permissions (
    member_id  UUID        NOT NULL REFERENCES classroom_members (id) ON DELETE CASCADE,
    permission VARCHAR(60) NOT NULL,
    PRIMARY KEY (member_id, permission)
);

CREATE INDEX idx_cm_permissions_member ON classroom_member_permissions (member_id);

-- ==============================================================
-- Source: V24__fund_bank_info_and_payment_method.sql
-- ==============================================================
-- Bank account info on fund (used to generate VietQR payment QR codes
-- and to display bank-transfer instructions to students).
ALTER TABLE funds
    ADD COLUMN bank_account_name   VARCHAR(100),
    ADD COLUMN bank_account_number VARCHAR(40),
    ADD COLUMN bank_bin            VARCHAR(10),
    ADD COLUMN bank_short_name     VARCHAR(40);

-- Payment method + gateway transaction reference for fund payments.
-- payment_method: CASH (offline), BANK_TRANSFER (VietQR), VNPAY, MOMO
ALTER TABLE fund_payments
    ADD COLUMN payment_method  VARCHAR(20) NOT NULL DEFAULT 'CASH',
    ADD COLUMN transaction_ref VARCHAR(100);

-- ==============================================================
-- Source: V25__attendance_sessions_from_timetable.sql
-- ==============================================================
-- Auto-generated attendance sessions tied to the timetable.
-- A session can now reference a specific subject + period + date so the
-- system can create one session per period of the day from the timetable
-- and let students self check-in until the period ends.
ALTER TABLE attendance_sessions
    ADD COLUMN subject_id      UUID,
    ADD COLUMN period_number   INTEGER,
    ADD COLUMN session_date    DATE,
    ADD COLUMN starts_at       TIMESTAMPTZ,
    ADD COLUMN auto_generated  BOOLEAN NOT NULL DEFAULT FALSE;

-- Prevent duplicate auto-generated sessions on the same period of the same
-- day. Teacher-created (manual) sessions have NULL period/date and aren't
-- subject to the constraint.
CREATE UNIQUE INDEX uq_attendance_session_period_date
    ON attendance_sessions (classroom_id, session_date, period_number)
    WHERE auto_generated = TRUE;

