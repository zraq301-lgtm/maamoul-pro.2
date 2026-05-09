import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const { currentOrg, user, hasPermission } = useAuth();
  const [entities, setEntities] = useState([]);
  const [records, setRecords] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEntities = useCallback(async () => {
    if (!currentOrg) return;
    setLoading(true);
    const { data } = await supabase
      .from('dynamic_entities')
      .select('*, dynamic_fields(*)')
      .eq('organization_id', currentOrg.id)
      .order('created_at', { ascending: true });
    setEntities(data || []);
    setLoading(false);
  }, [currentOrg]);

  const fetchRecords = useCallback(async (entityId) => {
    if (!currentOrg || !entityId) return [];
    const { data } = await supabase
      .from('dynamic_records')
      .select('*, record_values(*)')
      .eq('entity_id', entityId)
      .eq('organization_id', currentOrg.id)
      .order('created_at', { ascending: false });
    return data || [];
  }, [currentOrg]);

  const fetchWorkflows = useCallback(async () => {
    if (!currentOrg) return;
    const { data } = await supabase
      .from('workflows')
      .select('*, workflow_stages(*), workflow_transitions(*)')
      .eq('organization_id', currentOrg.id);
    setWorkflows(data || []);
  }, [currentOrg]);

  const fetchDashboardWidgets = useCallback(async () => {
    if (!currentOrg) return;
    const { data } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('organization_id', currentOrg.id);
    setDashboardWidgets(data || []);
  }, [currentOrg]);

  useEffect(() => {
    if (currentOrg) {
      fetchEntities();
      fetchWorkflows();
      fetchDashboardWidgets();
    }
  }, [currentOrg, fetchEntities, fetchWorkflows, fetchDashboardWidgets]);

  const createEntity = useCallback(async (entityData) => {
    if (!currentOrg || !hasPermission('manager')) return;
    const { data, error } = await supabase
      .from('dynamic_entities')
      .insert({ ...entityData, organization_id: currentOrg.id })
      .select()
      .single();
    if (error) throw error;
    if (entityData.fields?.length > 0) {
      const fields = entityData.fields.map((f, i) => ({
        ...f, entity_id: data.id, sort_order: i,
      }));
      await supabase.from('dynamic_fields').insert(fields);
    }
    await fetchEntities();
    return data;
  }, [currentOrg, hasPermission, fetchEntities]);

  const updateEntity = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('dynamic_entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await fetchEntities();
    return data;
  }, [fetchEntities]);

  const deleteEntity = useCallback(async (id) => {
    if (!hasPermission('admin')) return;
    const { error } = await supabase.from('dynamic_entities').delete().eq('id', id);
    if (error) throw error;
    await fetchEntities();
  }, [hasPermission, fetchEntities]);

  const createRecord = useCallback(async (entityId, recordData) => {
    if (!currentOrg || !hasPermission('member')) return;
    const { data: record, error: recErr } = await supabase
      .from('dynamic_records')
      .insert({
        entity_id: entityId,
        organization_id: currentOrg.id,
        name: recordData.name || 'New Record',
        created_by: user.id,
      })
      .select()
      .single();
    if (recErr) throw recErr;

    if (recordData.values) {
      const values = Object.entries(recordData.values).map(([fieldId, val]) => ({
        record_id: record.id,
        field_id: fieldId,
        value_text: typeof val === 'string' ? val : '',
        value_number: typeof val === 'number' ? val : null,
        value_boolean: typeof val === 'boolean' ? val : null,
        value_date: val instanceof Date ? val.toISOString().split('T')[0] : null,
        value_json: typeof val === 'object' && val !== null ? val : null,
      }));
      await supabase.from('record_values').insert(values);
    }
    return record;
  }, [currentOrg, hasPermission, user]);

  const updateRecord = useCallback(async (recordId, updates) => {
    if (!hasPermission('member')) return;
    const { data, error } = await supabase
      .from('dynamic_records')
      .update({ name: updates.name, status: updates.status })
      .eq('id', recordId)
      .select()
      .single();
    if (error) throw error;

    if (updates.values) {
      for (const [fieldId, val] of Object.entries(updates.values)) {
        await supabase.from('record_values').upsert({
          record_id: recordId,
          field_id: fieldId,
          value_text: typeof val === 'string' ? val : '',
          value_number: typeof val === 'number' ? val : null,
          value_boolean: typeof val === 'boolean' ? val : null,
          value_date: val instanceof Date ? val.toISOString().split('T')[0] : null,
          value_json: typeof val === 'object' && val !== null ? val : null,
        }, { onConflict: 'record_id,field_id' });
      }
    }
    return data;
  }, [hasPermission]);

  const deleteRecord = useCallback(async (recordId) => {
    if (!hasPermission('manager')) return;
    const { error } = await supabase.from('dynamic_records').delete().eq('id', recordId);
    if (error) throw error;
  }, [hasPermission]);

  const createWorkflow = useCallback(async (workflowData) => {
    if (!currentOrg || !hasPermission('manager')) return;
    const { data, error } = await supabase
      .from('workflows')
      .insert({ ...workflowData, organization_id: currentOrg.id })
      .select()
      .single();
    if (error) throw error;

    if (workflowData.stages?.length > 0) {
      const stages = workflowData.stages.map((s, i) => ({
        ...s, workflow_id: data.id, sort_order: i,
      }));
      await supabase.from('workflow_stages').insert(stages);
    }
    await fetchWorkflows();
    return data;
  }, [currentOrg, hasPermission, fetchWorkflows]);

  const createOrganization = useCallback(async (orgData) => {
    const slug = orgData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    const { data, error } = await supabase
      .from('organizations')
      .insert({ ...orgData, slug, created_by: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [user]);

  const value = {
    entities, records, workflows, dashboardWidgets, loading,
    fetchEntities, fetchRecords, fetchWorkflows, fetchDashboardWidgets,
    createEntity, updateEntity, deleteEntity,
    createRecord, updateRecord, deleteRecord,
    createWorkflow, createOrganization,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
