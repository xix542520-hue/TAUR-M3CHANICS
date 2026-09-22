/* TAUR DATA CORE V1
 * Thin compatibility layer over the existing TAUR database.
 * This is intentionally NOT a storage rewrite.
 */
(function(){
  'use strict';

  const root = window.TAUR = window.TAUR || {};
  root.errors = root.errors || [];
  function validationError(code, message, detail){
    const error = {code, message, detail: detail || null, at: now()};
    root.errors.push(error);
    emit('DATA_ERROR', error);
    return null;
  }
  const listeners = {};

  const now = () => new Date().toISOString();
  const asArray = value => Array.isArray(value) ? value : [];
  const id = () => (typeof uid === 'function' ? uid() :
    Date.now().toString(36) + Math.random().toString(36).slice(2,8));

  function emit(type, detail){
    (listeners[type] || []).slice().forEach(fn => {
      try { fn(detail); } catch (err) { console.error('[TAUR DATA]', err); }
    });
    (listeners['*'] || []).slice().forEach(fn => {
      try { fn({type, detail}); } catch (err) { console.error('[TAUR DATA]', err); }
    });
  }

  function on(type, handler){
    if(typeof handler !== 'function') return () => {};
    (listeners[type] ||= []).push(handler);
    return () => {
      const list = listeners[type];
      if(!list) return;
      const i = list.indexOf(handler);
      if(i >= 0) list.splice(i,1);
    };
  }

  function currentDb(){
    return db;
  }

  function ensureCollection(name){
    if(!Array.isArray(db[name])) db[name] = [];
    return db[name];
  }

  function find(name, recordId){
    return ensureCollection(name).find(x => x && x.id === recordId) || null;
  }

  function saveDb(){
    if(typeof save === 'function') save();
    emit('DATA_SAVED', {at: now()});
    return db;
  }

  function validateRelationships(name, data, recordId){
    const d = data || {};
    const exists = (collection, id) => !id || !!find(collection, id);
    if(name === 'vehicles' && d.customerId && !exists('customers', d.customerId))
      return validationError('INVALID_REFERENCE','Vehicle references a missing customer',{collection:name,id:recordId,field:'customerId',value:d.customerId});
    if(name === 'jobs'){
      if(d.customerId && !exists('customers', d.customerId))
        return validationError('INVALID_REFERENCE','Job references a missing customer',{collection:name,id:recordId,field:'customerId',value:d.customerId});
      if(d.vehicleId && !exists('vehicles', d.vehicleId))
        return validationError('INVALID_REFERENCE','Job references a missing vehicle',{collection:name,id:recordId,field:'vehicleId',value:d.vehicleId});
      if(d.customerId && d.vehicleId){
        const vehicle=find('vehicles',d.vehicleId);
        if(vehicle && vehicle.customerId && vehicle.customerId !== d.customerId)
          return validationError('REFERENCE_MISMATCH','Job customer does not own the referenced vehicle',{collection:name,id:recordId});
      }
    }
    if(name === 'quotes' && d.jobId && !exists('jobs', d.jobId))
      return validationError('INVALID_REFERENCE','Quote references a missing job',{collection:name,id:recordId,field:'jobId',value:d.jobId});
    if(name === 'payments' && d.jobId && !exists('jobs', d.jobId))
      return validationError('INVALID_REFERENCE','Payment references a missing job',{collection:name,id:recordId,field:'jobId',value:d.jobId});
    if(name === 'referrals'){
      if(d.customerId && !exists('customers',d.customerId)) return validationError('INVALID_REFERENCE','Referral references a missing customer',{collection:name,id:recordId,field:'customerId',value:d.customerId});
      if(d.vehicleId && !exists('vehicles',d.vehicleId)) return validationError('INVALID_REFERENCE','Referral references a missing vehicle',{collection:name,id:recordId,field:'vehicleId',value:d.vehicleId});
      if(d.partnerId && !exists('partners',d.partnerId)) return validationError('INVALID_REFERENCE','Referral references a missing partner',{collection:name,id:recordId,field:'partnerId',value:d.partnerId});
      if(d.jobId && !exists('jobs',d.jobId)) return validationError('INVALID_REFERENCE','Referral references a missing job',{collection:name,id:recordId,field:'jobId',value:d.jobId});
      if(d.customerId && d.vehicleId){const v=find('vehicles',d.vehicleId);if(v?.customerId && v.customerId!==d.customerId)return validationError('REFERENCE_MISMATCH','Referral customer does not own the referenced vehicle',{collection:name,id:recordId});}
    }
    return true;
  }

  function create(name, data){
    if(!data || typeof data !== 'object') return validationError('INVALID_RECORD','Record payload must be an object',{collection:name});
    const record = Object.assign({
      id: id(),
      created: now(),
      updated: now()
    }, data || {});
    if(!validateRelationships(name,record,record.id)) return null;
    ensureCollection(name).push(record);
    saveDb();
    emit(name.toUpperCase() + '_CREATED', record);
    return record;
  }

  function update(name, recordId, patch){
    const record = find(name, recordId);
    if(!record) return validationError('NOT_FOUND','Record was not found',{collection:name,id:recordId});
    if(patch && typeof patch !== 'object') return validationError('INVALID_PATCH','Patch must be an object',{collection:name,id:recordId});
    const candidate = Object.assign({}, record, patch || {});
    if(!validateRelationships(name,candidate,recordId)) return null;
    Object.assign(record, patch || {}, {updated: now()});
    saveDb();
    emit(name.toUpperCase() + '_UPDATED', record);
    return record;
  }

  function remove(name, recordId){
    const collection = ensureCollection(name);
    const index = collection.findIndex(x => x && x.id === recordId);
    if(index < 0) return null;
    const linked = {
      customers: ['vehicles','jobs','referrals'],
      vehicles: ['jobs','referrals'],
      jobs: ['payments','quotes','referrals'],
      partners: ['referrals']
    };
    const dependents = (linked[name]||[]).flatMap(child =>
      ensureCollection(child).filter(x => x && (
        (name==='customers' && x.customerId===recordId) ||
        (name==='vehicles' && (x.vehicleId===recordId || x.customerId===recordId && child==='referrals')) ||
        (name==='jobs' && x.jobId===recordId) ||
        (name==='partners' && x.partnerId===recordId)
      )).map(x=>({collection:child,id:x.id}))
    );
    if(dependents.length)
      return validationError('DEPENDENCY_EXISTS','Record cannot be removed while linked records exist',{collection:name,id:recordId,dependents});
    const removed = collection.splice(index,1)[0];
    const tombstones = ensureCollection('tombstones');
    const tombstoneId = name + ':' + recordId;
    const existing = tombstones.find(x => x && x.id === tombstoneId);
    const tombstone = {
      id: tombstoneId,
      collection: name,
      recordId,
      deletedAt: now()
    };
    if(existing) Object.assign(existing, tombstone);
    else tombstones.push(tombstone);
    saveDb();
    emit(name.toUpperCase() + '_REMOVED', removed);
    emit('TOMBSTONE_CREATED', tombstone);
    return removed;
  }

  const customers = {
    get: id => find('customers', id),
    list: () => ensureCollection('customers'),
    create: data => create('customers', data),
    update: (id, patch) => update('customers', id, patch),
    remove: id => remove('customers', id)
  };

  const vehicles = {
    get: id => find('vehicles', id),
    list: () => ensureCollection('vehicles'),
    listByCustomer: customerId =>
      ensureCollection('vehicles').filter(v => v && v.customerId === customerId),
    create: data => create('vehicles', data),
    update: (id, patch) => update('vehicles', id, patch),
    remove: id => remove('vehicles', id)
  };

  const jobs = {
    get: id => find('jobs', id),
    list: () => ensureCollection('jobs'),
    listByType: type =>
      ensureCollection('jobs').filter(j => (j && j.type) === type),
    listByCustomer: customerId =>
      ensureCollection('jobs').filter(j => j && j.customerId === customerId),
    listByVehicle: vehicleId =>
      ensureCollection('jobs').filter(j => j && j.vehicleId === vehicleId),
    create: data => create('jobs', Object.assign({
      stage: 'INTAKE',
      status: 'OPEN',
      total: 0
    }, data || {})),
    update: (id, patch) => update('jobs', id, patch),
    remove: id => remove('jobs', id),
    balance: id => {
      const job = jobs.get(id);
      if(!job) return 0;
      return Math.max(0, Number(job.total || 0) - payments.baseForJob(id));
    }
  };

  const quotes = {
    get: id => find('quotes', id),
    list: () => ensureCollection('quotes'),
    listByCustomer: customerId =>
      ensureCollection('quotes').filter(q => q && q.customerId === customerId),
    listByJob: jobId =>
      ensureCollection('quotes').filter(q => q && q.jobId === jobId),
    create: data => create('quotes', Object.assign({
      status: 'DRAFT',
      total: 0
    }, data || {})),
    update: (id, patch) => update('quotes', id, patch),
    remove: id => remove('quotes', id)
  };

  const leads = {
    get: id => find('leads', id),
    list: () => ensureCollection('leads'),
    create: data => create('leads', data),
    update: (id, patch) => update('leads', id, patch),
    remove: id => remove('leads', id)
  };

  const estimates = {
    get: id => find('estimates', id),
    list: () => ensureCollection('estimates'),
    create: data => create('estimates', data),
    update: (id, patch) => update('estimates', id, patch),
    remove: id => remove('estimates', id)
  };

  const payments = {
    get: id => find('payments', id),
    list: () => ensureCollection('payments'),
    forJob: jobId =>
      ensureCollection('payments').filter(p => p && p.jobId === jobId),

    baseAmount: payment => {
      if(!payment) return 0;
      if(Number(payment.amount||0) < 0 || Number(payment.tip||0) < 0) return 0;
      if(payment.baseAmount !== undefined && payment.baseAmount !== null)
        return Number(payment.baseAmount || 0);
      return Number(payment.amount || 0) - Number(payment.tip || 0);
    },

    tipAmount: payment => Number(payment && payment.tip || 0),

    baseForJob: jobId =>
      payments.forJob(jobId).reduce((sum,p) => sum + payments.baseAmount(p), 0),

    tipsForJob: jobId =>
      payments.forJob(jobId).reduce((sum,p) => sum + payments.tipAmount(p), 0),

    collectedForJob: jobId =>
      payments.forJob(jobId).reduce((sum,p) =>
        sum + payments.baseAmount(p) + payments.tipAmount(p), 0),

    create: data => {
      const payload = Object.assign({}, data || {});
      if(payload.amount === undefined && payload.baseAmount !== undefined)
        payload.amount = Number(payload.baseAmount || 0) + Number(payload.tip || 0);
      return create('payments', payload);
    },

    update: (id, patch) => update('payments', id, patch),
    remove: id => remove('payments', id)
  };

  root.version = '1.0.0';
  root.data = {
    get db(){ return currentDb(); },
    customers,
    vehicles,
    jobs,
    quotes,
    payments,
    pricebook,
    partners,
    referrals,
    leads,
    estimates,
    refresh: () => currentDb()
  };

  root.on = on;
  root.emit = emit;

  root.commit = function(){
    return saveDb();
  };

  root.storage = {
    key: (typeof KEY !== 'undefined' ? KEY : 'TAUR_M3CHANICS_FINAL_V1'),
    save: saveDb
  };

  // Compatibility helpers for future modules.
  root.getCustomer = customers.get;
  root.getVehicle = vehicles.get;
  root.getJob = jobs.get;
  root.getQuote = quotes.get;

  // Make the financial truth explicit without changing legacy jobPaid yet.
  root.finance = {
    baseForJob: payments.baseForJob,
    tipsForJob: payments.tipsForJob,
    collectedForJob: payments.collectedForJob,
    balanceForJob: jobs.balance
  };

  emit('DATA_CORE_READY', {version: root.version});
})();
