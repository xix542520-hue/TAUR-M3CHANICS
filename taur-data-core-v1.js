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
  const eventHistory = [];
  const EVENT_HISTORY_LIMIT = 250;
  let transactionActive = false;
  let transactionEvents = [];
  let transactionId = '';

  const now = () => new Date().toISOString();
  const asArray = value => Array.isArray(value) ? value : [];
  const id = () => (typeof uid === 'function' ? uid() :
    Date.now().toString(36) + Math.random().toString(36).slice(2,8));

  function recordEvent(type, detail){
    eventHistory.push({type,detail:detail||null,at:now(),transactionId:transactionId||null});
    if(eventHistory.length>EVENT_HISTORY_LIMIT) eventHistory.splice(0,eventHistory.length-EVENT_HISTORY_LIMIT);
  }
  function emit(type, detail){
    if(transactionActive){
      transactionEvents.push({type,detail});
      return;
    }
    recordEvent(type,detail);
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
    if(transactionActive) return db;
    if(typeof save === 'function') save();
    emit('DATA_SAVED', {at: now()});
    return db;
  }

  function flushTransactionEvents(){
    const events = transactionEvents.slice();
    transactionEvents = [];
    events.forEach(e => emit(e.type,e.detail));
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
    const collection = ensureCollection(name);
    if(collection.some(x => x && x.id === record.id))
      return validationError('DUPLICATE_ID','Record id already exists',{collection:name,id:record.id});
    if(!validateRelationships(name,record,record.id)) return null;
    collection.push(record);
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
        (name==='vehicles' && x.vehicleId===recordId) ||
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
  const tombstones = {
    get: id => find('tombstones', id),
    list: () => ensureCollection('tombstones')
  };

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
    tombstones,
    refresh: () => currentDb()
  };

  root.on = on;
  root.emit = emit;
  root.diagnostics = {
    errors: () => root.errors.slice(),
    lastError: () => root.errors.length ? root.errors[root.errors.length - 1] : null,
    clearErrors: () => { root.errors.length = 0; return true; }
  };
  root.events = {
    history: () => eventHistory.slice(),
    recent: limit => eventHistory.slice(-(Math.max(1,Number(limit)||25))),
    clear: () => { eventHistory.length = 0; return true; }
  };

  root.commit = function(){
    return saveDb();
  };

  root.transaction = function(work){
    if(typeof work !== 'function') return validationError('INVALID_TRANSACTION','Transaction callback must be a function');
    if(transactionActive) return validationError('NESTED_TRANSACTION','Nested transactions are not supported');
    const snapshot = JSON.stringify(db);
    const previousEvents = transactionEvents;
    transactionEvents = [];
    transactionId = id();
    transactionActive = true;
    try{
      const result = work();
      if(result === false){
        const restored = JSON.parse(snapshot);
        Object.keys(db).forEach(k=>delete db[k]);
        Object.assign(db,restored);
        const rolledBackTransactionId = transactionId;
        const rolledBackEventCount = transactionEvents.length;
        transactionEvents = [];
        transactionActive = false;
        emit('TRANSACTION_ROLLED_BACK',{at:now(),transactionId:rolledBackTransactionId,eventCount:rolledBackEventCount,outcome:'ROLLED_BACK',reason:'callback returned false'});
        transactionId = '';
        transactionEvents = previousEvents;
        return null;
      }
      transactionActive = false;
      const committedTransactionId = transactionId;
      const committedEventCount = transactionEvents.length;
      saveDb();
      flushTransactionEvents();
      emit('TRANSACTION_COMMITTED',{at:now(),transactionId:committedTransactionId,eventCount:committedEventCount,outcome:'COMMITTED'});
      transactionEvents = previousEvents;
      transactionId = '';
      return result;
    }catch(error){
      try{
        const restored = JSON.parse(snapshot);
        Object.keys(db).forEach(k=>delete db[k]);
        Object.assign(db,restored);
      }catch(rollbackError){ console.error('[TAUR DATA] rollback failed',rollbackError); }
      const failedTransactionId = transactionId;
      const failedEventCount = transactionEvents.length;
      transactionEvents = [];
      transactionActive = false;
      emit('TRANSACTION_ROLLED_BACK',{at:now(),transactionId:failedTransactionId,eventCount:failedEventCount,outcome:'ROLLED_BACK',reason:'exception'});
      transactionId = '';
      transactionEvents = previousEvents;
      return validationError('TRANSACTION_FAILED',error?.message||'Transaction failed');
    }
  };

  root.tests = {
    run: function(){
      const snapshot = JSON.stringify(db);
      const results = [];
      const assert = (name, condition) => {
        results.push({name,pass:!!condition});
        if(!condition) throw new Error(name);
      };
      try{
        const customer = customers.create({name:'__TAUR_TEST_CUSTOMER__'});
        assert('customer create', !!customer);
        const vehicle = vehicles.create({customerId:customer.id,make:'TEST',model:'TEST'});
        assert('vehicle create', !!vehicle);
        assert('invalid vehicle reference rejected', vehicles.create({customerId:'__missing__'}) === null);
        const job = jobs.create({customerId:customer.id,vehicleId:vehicle.id,total:100});
        assert('job create', !!job);
        assert('customer/vehicle mismatch rejected', jobs.create({customerId:'__other__',vehicleId:vehicle.id}) === null);
        assert('invalid payment reference rejected', payments.create({jobId:'__missing__',amount:10}) === null);
        const payment = payments.create({jobId:job.id,baseAmount:80,tip:20});
        assert('payment create', !!payment);
        assert('base payment excludes tip', payments.baseForJob(job.id) === 80);
        assert('tip tracked separately', payments.tipsForJob(job.id) === 20);
        assert('job balance uses base payment', jobs.balance(job.id) === 20);
        assert('dependent customer delete blocked', customers.remove(customer.id) === null);
        const rollbackResult = transaction(()=>{
          const temp = customers.create({name:'__TAUR_ROLLBACK__'});
          assert('transaction create', !!temp);
          return false;
        });
        let transactionEventCount = 0;
        const offTransactionTest = on('*', e => { if(e?.type==='TRANSACTION_TEST_EVENT') transactionEventCount++; });
        const txRecord = customers.create({name:'__TAUR_TX_EVENT__'});
        const beforeTxEvents = transactionEventCount;
        root.transaction(() => { customers.update(txRecord.id,{name:'__TAUR_TX_EVENT_UPDATED__'}); emit('TRANSACTION_TEST_EVENT',{id:txRecord.id}); return false; });
        assert('transaction events suppressed on rollback', transactionEventCount===beforeTxEvents);
        offTransactionTest();
        assert('transaction rollback', rollbackResult === null && !customers.list().some(x=>x.name==='__TAUR_ROLLBACK__'));
        let savedEvents = 0, committedEvents = 0;
        const offSavedTest = on('DATA_SAVED', () => savedEvents++);
        const offCommittedTest = on('TRANSACTION_COMMITTED', () => committedEvents++);
        const savedBeforeCommit = savedEvents, committedBeforeCommit = committedEvents;
        const commitResult = transaction(()=>{
          const temp = customers.create({name:'__TAUR_COMMIT__'});
          assert('transaction commit create', !!temp);
          return temp;
        });
        assert('transaction commit', !!commitResult && !!customers.get(commitResult.id));
        assert('commit persists once', savedEvents===savedBeforeCommit+1);
        assert('commit emits once', committedEvents===committedBeforeCommit+1);
        const savedBeforeRollback = savedEvents, committedBeforeRollback = committedEvents;
        const rollbackEventResult = transaction(()=>{
          customers.create({name:'__TAUR_ROLLBACK_EVENTS__'});
          return false;
        });
        assert('rollback has no save event', savedEvents===savedBeforeRollback);
        assert('rollback has no commit event', committedEvents===committedBeforeRollback);
        assert('rollback removes created record', !customers.list().some(x=>x.name==='__TAUR_ROLLBACK_EVENTS__'));
        const thrownRollback = transaction(()=>{
          customers.create({name:'__TAUR_THROW_ROLLBACK__'});
          throw new Error('forced rollback');
        });
        assert('thrown transaction rolls back', thrownRollback===null && !customers.list().some(x=>x.name==='__TAUR_THROW_ROLLBACK__'));
        offSavedTest(); offCommittedTest();
        customers.remove(commitResult.id);
        const partner = partners.create({name:'__TAUR_TEST_PARTNER__'});
        assert('partner create', !!partner);
        const referral = referrals.create({customerId:customer.id,vehicleId:vehicle.id,partnerId:partner.id,jobId:job.id});
        assert('referral create', !!referral);
        assert('referral customer mismatch rejected', referrals.create({customerId:'__other__',vehicleId:vehicle.id}) === null);
        assert('job deletion blocked by payment history', jobs.remove(job.id) === null);
        remove('referrals',referral.id);
        remove('partners',partner.id);
        const tombstone = remove('payments',payment.id);
        assert('safe delete creates tombstone', !!tombstone && !!tombstones.get('payments:'+payment.id));
        return {ok:true,results};
      }catch(error){
        return {ok:false,error:error?.message||String(error),results};
      }finally{
        const restored = JSON.parse(snapshot);
        Object.keys(db).forEach(k=>delete db[k]);
        Object.assign(db,restored);
        saveDb();
      }
    }
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
