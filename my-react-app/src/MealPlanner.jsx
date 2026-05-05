import { useState, useEffect } from 'react';
import { Button } from './App';
import { getSavedRecipes } from './varManager.jsx'; // to select from saved recipes when creating events in the planner (future feature)
import { getUID } from './varManager.jsx';

export function MealPlanner(){
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const [plannerEvents, setPlannerEvents] = useState({});
    const [plannerDate, setPlannerDate] = useState(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        d.setDate(1);
        return d;
    });
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editingDateKey, setEditingDateKey] = useState(todayKey);
    const [editingEventId, setEditingEventId] = useState(null);
    const [modalEventDate, setModalEventDate] = useState(todayKey);
    const [modalEventName, setModalEventName] = useState('');
    const [modalEventTime, setModalEventTime] = useState('12:00');
    const uid = getUID();

    useEffect(() => {
        if (uid !== 'none') {
            fetchPlannedMeals();
        } else {
            setPlannerEvents({});
        }
    }, [uid]);

    async function fetchPlannedMeals() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/plannedMeals?userID=${uid}`);
            const events = await res.json();
            const eventsObj = {};
            events.forEach(ev => {
                if (!eventsObj[ev.date]) eventsObj[ev.date] = [];
                eventsObj[ev.date].push(ev);
            });
            setPlannerEvents(eventsObj);
        } catch (error) {
            console.error('Failed to fetch planned meals:', error);
        }
    }

    async function saveEventsToBackend(eventsObj) {
        if (uid === 'none') return;
        const events = [];
        Object.keys(eventsObj).forEach(date => {
            eventsObj[date].forEach(ev => events.push(ev));
        });
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/user/plannedMeals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: uid, events })
            });
        } catch (error) {
            console.error('Failed to save planned meals:', error);
        }
    }

    function formatDate(d) {
        return d.toISOString().split('T')[0];
    }

    function getCalendarGrid() {
        const year = plannerDate.getFullYear();
        const month = plannerDate.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const startIndex = firstOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];

        for (let i = 0; i < 42; i++) {
          const dayNum = i - startIndex + 1;
          if (i < startIndex || dayNum > daysInMonth) {
            grid.push(null);
          } else {
            grid.push(new Date(year, month, dayNum));
          }
        }

        return grid;
    }

    function openAddEventModal(dateKey) {
        setIsEditingEvent(false);
        setEditingEventId(null);
        setEditingDateKey(dateKey);
        setModalEventDate(dateKey);
        setModalEventName('');
        setModalEventTime('12:00');
        setEventModalOpen(true);
    }

    function openEditEventModal(dateKey, event) {
        setIsEditingEvent(true);
        setEditingEventId(event.id);
        setEditingDateKey(dateKey);
        setModalEventDate(dateKey);
        setModalEventName(event.name);
        setModalEventTime(event.time);
        setEventModalOpen(true);
    }

    function closeEventModal() {
        setEventModalOpen(false);
        setIsEditingEvent(false);
        setEditingEventId(null);
    }

    function saveEvent() {
        if (!modalEventName.trim()) {
          return;
        }

        const dateKey = modalEventDate;

        if (isEditingEvent && editingEventId) {
          setPlannerEvents(prev => {
            const existing = prev[editingDateKey] || [];
            const updatedEvents = existing.filter(ev => ev.id !== editingEventId);
            const movedEvent = {
              id: editingEventId,
              name: modalEventName.trim(),
              date: dateKey,
              time: modalEventTime,
            };
            const nextState = {
              ...prev,
              [editingDateKey]: updatedEvents,
            };

            if (updatedEvents.length === 0) {
              delete nextState[editingDateKey];
            }

            const destinationEvents = nextState[dateKey] || [];
            nextState[dateKey] = [...destinationEvents, movedEvent];

            saveEventsToBackend(nextState);
            return nextState;
          });
        } else {
          const event = {
            id: `${dateKey}-${Date.now()}`,
            name: modalEventName.trim(),
            date: dateKey,
            time: modalEventTime,
          };

          setPlannerEvents(prev => {
            const existing = prev[dateKey] || [];
            const nextState = {
              ...prev,
              [dateKey]: [...existing, event],
            };
            saveEventsToBackend(nextState);
            return nextState;
          });
        }

        closeEventModal();
    }

    function deleteEvent() {
        if (!isEditingEvent || !editingEventId) {
          return;
        }

        setPlannerEvents(prev => {
          const existing = prev[editingDateKey] || [];
          const updatedEvents = existing.filter(ev => ev.id !== editingEventId);
          const nextState = {
            ...prev,
            [editingDateKey]: updatedEvents,
          };

          if (updatedEvents.length === 0) {
            delete nextState[editingDateKey];
          }

          saveEventsToBackend(nextState);
          return nextState;
        });

        closeEventModal();
    }

    function deleteAllPastEvents() {
        setPlannerEvents(prev => {
          const nextState = {};
          Object.keys(prev).forEach(dateKey => {
            if (dateKey >= todayKey) {
              nextState[dateKey] = prev[dateKey];
            }
          });
          saveEventsToBackend(nextState);
          return nextState;
        });
    }

    function prevMonth() {
        const d = new Date(plannerDate);
        d.setMonth(d.getMonth() - 1);
        d.setDate(1);
        setPlannerDate(d);
    }

    function nextMonth() {
        const d = new Date(plannerDate);
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        setPlannerDate(d);
    }

    const modalOverlayStyle = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '12px',
    };

    const modalBoxStyle = {
        width: '100%',
        maxWidth: '420px',
        background: '#161616',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        color: '#fff',
    };

    const fieldLabelStyle = {
        display: 'block',
        marginBottom: '12px',
        fontSize: '14px',
        color: '#f5f5f5',
    };

    const fieldInputStyle = {
        width: '100%',
        marginTop: '6px',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #444',
        background: '#222',
        color: '#fff',
    };

    return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button onClick={prevMonth}>◀</Button>
              <strong style={{ color: '#ffffff', fontSize: '18px' }}>{plannerDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
              <Button onClick={nextMonth}>▶</Button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button onClick={() => openAddEventModal(todayKey)}>
                Plan Meal
              </Button>
              <Button
                onClick={deleteAllPastEvents}
                style={{ background: '#d32f2f', color: '#fff' }}
              >
                Delete All Past
              </Button>
            </div>
          </div>

          <div className="planner-calendar" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ color: '#fff', fontWeight: 'bold' }}>{d}</div>
            ))}

            {getCalendarGrid().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: '90px', background: '#2b2b2b', borderRadius: '6px' }} />;
              }

              const dayKey = formatDate(date);
              const events = plannerEvents[dayKey] || [];
              const isToday = dayKey === todayKey;

              return (
                <div
                  key={dayKey}
                  style={{
                    minHeight: '90px',
                    background: isToday ? '#3272d9' : '#2b2b2b',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => openAddEventModal(dayKey)}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{date.getDate()}</div>
                  {events.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      style={{ fontSize: '11px', marginBottom: '4px', textAlign: 'left', padding: '4px 6px', borderRadius: '6px', background: '#1f1f1f' }}
                      onClick={e => {
                        e.stopPropagation();
                        openEditEventModal(dayKey, ev);
                      }}
                    >
                      {ev.time} {ev.name}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div style={{ fontSize: '10px', opacity: 0.8, textAlign: 'left' }}>+{events.length - 3} more</div>
                  )}
                </div>
              );
            })}
          </div>

          {eventModalOpen && (
            <div style={modalOverlayStyle} onClick={closeEventModal}>
              <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '22px' }}>{isEditingEvent ? 'Edit Plan' : 'Plan Meal'}</h2>
                    <p style={{ margin: '6px 0 0', color: '#bbb', fontSize: '13px' }}>Use the fields below to save or update the event.</p>
                  </div>
                  <button
                    onClick={closeEventModal}
                    style={{ background: 'transparent', border: 'none', color: '#bbb', fontSize: '18px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <label style={fieldLabelStyle}>
                  Food name
                  <input
                    type="text"
                    placeholder="Food name"
                    value={modalEventName}
                    onChange={e => setModalEventName(e.target.value)}
                    style={fieldInputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  Event Date
                  <input
                    type="date"
                    value={modalEventDate}
                    onChange={e => setModalEventDate(e.target.value)}
                    style={fieldInputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  Time
                  <input
                    type="time"
                    value={modalEventTime}
                    onChange={e => setModalEventTime(e.target.value)}
                    style={fieldInputStyle}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '22px', flexWrap: 'wrap' }}>
                  <Button onClick={saveEvent} style={{ flex: 1 }}>Save</Button>
                  <Button onClick={closeEventModal} style={{ flex: 1, background: '#444', color: '#fff' }}>Cancel</Button>
                </div>

                {isEditingEvent && (
                  <button
                    onClick={deleteEvent}
                    style={{
                      marginTop: '14px',
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#d32f2f',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Delete Plan
                  </button>
                )}
              </div>
            </div>
          )}
        </>
    );
}


