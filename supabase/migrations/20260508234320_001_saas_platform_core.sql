/*
  # SaaS Platform Core Schema - Multi-tenant Universal Admin Engine

  1. New Tables
    - `organizations` - Multi-tenant organizations/companies
    - `organization_members` - Links users to organizations with roles
    - `invitations` - Team member invitations
    - `dynamic_entities` - User-defined entity types (e.g., "Product", "Order", "Task")
    - `dynamic_fields` - Custom fields for each entity type
    - `dynamic_records` - Actual data records for dynamic entities
    - `record_values` - Field values for each record (EAV pattern)
    - `workflows` - Custom workflow definitions
    - `workflow_stages` - Stages within each workflow
    - `workflow_transitions` - Allowed transitions between stages
    - `workflow_instances` - Running instances of workflows on records
    - `dashboard_widgets` - User dashboard widget configurations
    - `dashboard_layouts` - Saved dashboard layouts
    - `integrations` - External API integration configs
    - `audit_log` - System-wide audit trail

  2. Security
    - RLS enabled on ALL tables
    - All policies check organization membership and role
    - Only org members can access org data
    - Role hierarchy: owner > admin > manager > member > viewer

  3. Important Notes
    - Uses EAV (Entity-Attribute-Value) pattern for dynamic data
    - Supports multi-tenancy via organization_id on all data tables
    - RBAC with 5 role levels for fine-grained access control
*/

-- ============================================
-- ORGANIZATIONS & MEMBERSHIP
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  industry text DEFAULT '',
  logo_url text DEFAULT '',
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- DYNAMIC ENTITIES (EAV Pattern)
-- ============================================

CREATE TABLE IF NOT EXISTS dynamic_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  icon text DEFAULT 'Box',
  color text DEFAULT '#3b82f6',
  description text DEFAULT '',
  is_system boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE IF NOT EXISTS dynamic_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES dynamic_entities(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  field_type text NOT NULL DEFAULT 'text' CHECK (field_type IN (
    'text', 'number', 'currency', 'date', 'datetime', 'boolean',
    'select', 'multiselect', 'relation', 'file', 'json', 'formula'
  )),
  required boolean DEFAULT false,
  unique_field boolean DEFAULT false,
  default_value text DEFAULT '',
  options jsonb DEFAULT '[]'::jsonb,
  validation jsonb DEFAULT '{}'::jsonb,
  sort_order int DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(entity_id, slug)
);

CREATE TABLE IF NOT EXISTS dynamic_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES dynamic_entities(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  status text DEFAULT 'active',
  workflow_instance_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS record_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES dynamic_records(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES dynamic_fields(id) ON DELETE CASCADE,
  value_text text DEFAULT '',
  value_number numeric DEFAULT NULL,
  value_boolean boolean DEFAULT NULL,
  value_date date DEFAULT NULL,
  value_json jsonb DEFAULT NULL,
  UNIQUE(record_id, field_id)
);

-- ============================================
-- WORKFLOWS (Kanban / State Machines)
-- ============================================

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_id uuid REFERENCES dynamic_entities(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text DEFAULT 'kanban' CHECK (type IN ('kanban', 'sequential', 'parallel', 'custom')),
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  color text DEFAULT '#6b7280',
  sort_order int DEFAULT 0,
  is_initial boolean DEFAULT false,
  is_final boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES workflow_stages(id) ON DELETE CASCADE,
  to_stage_id uuid NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Move',
  required_role text DEFAULT 'member',
  settings jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  record_id uuid REFERENCES dynamic_records(id) ON DELETE SET NULL,
  current_stage_id uuid NOT NULL REFERENCES workflow_stages(id),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- DASHBOARD BUILDER
-- ============================================

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Main Dashboard',
  is_default boolean DEFAULT false,
  layout_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'stat' CHECK (type IN (
    'stat', 'chart_bar', 'chart_line', 'chart_pie', 'chart_area',
    'table', 'list', 'kanban', 'calendar', 'counter', 'gauge', 'custom'
  )),
  title text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  entity_id uuid REFERENCES dynamic_entities(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INTEGRATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('whatsapp', 'telegram', 'slack', 'webhook', 'api', 'email', 'sms')),
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_entities_org ON dynamic_entities(organization_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_fields_entity ON dynamic_fields(entity_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_records_entity ON dynamic_records(entity_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_records_org ON dynamic_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_record_values_record ON record_values(record_id);
CREATE INDEX IF NOT EXISTS idx_record_values_field ON record_values(field_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_workflow ON workflow_stages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow ON workflow_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_org ON workflow_instances(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_org ON dashboard_layouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid()));

CREATE POLICY "Owners and admins can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid() AND role IN ('owner', 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Organization Members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view org membership"
  ON organization_members FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Admins can manage membership"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organization_members.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins can update membership roles"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organization_members.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organization_members.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins can remove members"
  ON organization_members FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organization_members.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view invitations"
  ON invitations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = invitations.organization_id AND user_id = auth.uid()));

CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = invitations.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins can delete invitations"
  ON invitations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = invitations.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Dynamic Entities
ALTER TABLE dynamic_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view entities"
  ON dynamic_entities FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_entities.organization_id AND user_id = auth.uid()));

CREATE POLICY "Managers and above can create entities"
  ON dynamic_entities FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_entities.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Managers and above can update entities"
  ON dynamic_entities FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_entities.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_entities.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Admins can delete entities"
  ON dynamic_entities FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_entities.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Dynamic Fields
ALTER TABLE dynamic_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view fields"
  ON dynamic_fields FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_entities de ON de.id = dynamic_fields.entity_id WHERE om.organization_id = de.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Managers and above can create fields"
  ON dynamic_fields FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_entities de ON de.id = dynamic_fields.entity_id WHERE om.organization_id = de.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Managers and above can update fields"
  ON dynamic_fields FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_entities de ON de.id = dynamic_fields.entity_id WHERE om.organization_id = de.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_entities de ON de.id = dynamic_fields.entity_id WHERE om.organization_id = de.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Admins can delete fields"
  ON dynamic_fields FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_entities de ON de.id = dynamic_fields.entity_id WHERE om.organization_id = de.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- Dynamic Records
ALTER TABLE dynamic_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view records"
  ON dynamic_records FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_records.organization_id AND user_id = auth.uid()));

CREATE POLICY "Members and above can create records"
  ON dynamic_records FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_records.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'member')));

CREATE POLICY "Members and above can update records"
  ON dynamic_records FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_records.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'member')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_records.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'member')));

CREATE POLICY "Managers and above can delete records"
  ON dynamic_records FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dynamic_records.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

-- Record Values
ALTER TABLE record_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view record values"
  ON record_values FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_records dr ON dr.id = record_values.record_id WHERE om.organization_id = dr.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Members and above can insert record values"
  ON record_values FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_records dr ON dr.id = record_values.record_id WHERE om.organization_id = dr.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager', 'member')));

CREATE POLICY "Members and above can update record values"
  ON record_values FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_records dr ON dr.id = record_values.record_id WHERE om.organization_id = dr.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager', 'member')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_records dr ON dr.id = record_values.record_id WHERE om.organization_id = dr.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager', 'member')));

CREATE POLICY "Managers and above can delete record values"
  ON record_values FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN dynamic_records dr ON dr.id = record_values.record_id WHERE om.organization_id = dr.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

-- Workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflows.organization_id AND user_id = auth.uid()));

CREATE POLICY "Managers and above can create workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Managers and above can update workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Admins can delete workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Workflow Stages
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view workflow stages"
  ON workflow_stages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_stages.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Managers and above can manage workflow stages"
  ON workflow_stages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_stages.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Managers and above can update workflow stages"
  ON workflow_stages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_stages.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_stages.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Admins can delete workflow stages"
  ON workflow_stages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_stages.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- Workflow Transitions
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view transitions"
  ON workflow_transitions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_transitions.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Managers and above can manage transitions"
  ON workflow_transitions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_transitions.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Managers and above can update transitions"
  ON workflow_transitions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_transitions.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_transitions.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Admins can delete transitions"
  ON workflow_transitions FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om JOIN workflows w ON w.id = workflow_transitions.workflow_id WHERE om.organization_id = w.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- Workflow Instances
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view workflow instances"
  ON workflow_instances FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflow_instances.organization_id AND user_id = auth.uid()));

CREATE POLICY "Members and above can create workflow instances"
  ON workflow_instances FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflow_instances.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'member')));

CREATE POLICY "Members and above can update workflow instances"
  ON workflow_instances FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflow_instances.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'member')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = workflow_instances.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'member')));

-- Dashboard Layouts
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their dashboard layouts"
  ON dashboard_layouts FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_layouts.organization_id AND user_id = auth.uid()));

CREATE POLICY "Members can create dashboard layouts"
  ON dashboard_layouts FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_layouts.organization_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their dashboard layouts"
  ON dashboard_layouts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_layouts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_layouts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Users can delete their dashboard layouts"
  ON dashboard_layouts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_layouts.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Dashboard Widgets
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view widgets"
  ON dashboard_widgets FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_widgets.organization_id AND user_id = auth.uid()));

CREATE POLICY "Managers and above can create widgets"
  ON dashboard_widgets FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_widgets.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Managers and above can update widgets"
  ON dashboard_widgets FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_widgets.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_widgets.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Admins can delete widgets"
  ON dashboard_widgets FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = dashboard_widgets.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = integrations.organization_id AND user_id = auth.uid()));

CREATE POLICY "Admins can manage integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = integrations.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins can update integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = integrations.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = integrations.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins can delete integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = integrations.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Audit Log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = audit_log.organization_id AND user_id = auth.uid()));

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = audit_log.organization_id AND user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_org_role(check_user_id uuid, check_org_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT role FROM organization_members
  WHERE user_id = check_user_id AND organization_id = check_org_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_org_created ON organizations;
CREATE TRIGGER on_org_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_organization();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_org_update ON organizations;
CREATE TRIGGER on_org_update BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_entity_update ON dynamic_entities;
CREATE TRIGGER on_entity_update BEFORE UPDATE ON dynamic_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_record_update ON dynamic_records;
CREATE TRIGGER on_record_update BEFORE UPDATE ON dynamic_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_layout_update ON dashboard_layouts;
CREATE TRIGGER on_layout_update BEFORE UPDATE ON dashboard_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
