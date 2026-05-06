import { useState, useEffect } from 'react';
import { Button } from './App';
import { getSavedRecipes } from './varManager.jsx'; // to select from saved recipes when creating events in the planner (future feature)
import { getUID } from './varManager.jsx';

export function MealPlanner(){
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`; // YYYY-MM-DD format for consistent date keys
    const [plannerEvents, setPlannerEvents] = useState({});
    const [plannerDate, setPlannerDate] = useState(() => { // initialize to first day of current month
        const d = new Date();
        d.setHours(0,0,0,0);
        d.setDate(1);
        return d;
    });
    //state for controlling the add/edit event modal
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editingDateKey, setEditingDateKey] = useState(todayKey);
    const [editingEventId, setEditingEventId] = useState(null);
    const [modalEventDate, setModalEventDate] = useState(todayKey);
    const [modalEventName, setModalEventName] = useState('');
    const [modalEventTime, setModalEventTime] = useState('12:00');
    // counter to keep track of total number of events for enforcing the limit of 200 planned meals
    const maxEvents = 200;
    const [eventCounter, setEventCounter] = useState(0);
    const [limitNotificationOpen, setLimitNotificationOpen] = useState(false);
    const uid = getUID(); // get current user ID for fetching/saving planned meals
    
    //fetch planned meals on component mount and whenever userID changes
    useEffect(() => {
        if (uid !== 'none') {
            fetchPlannedMeals();
        } else {
            setPlannerEvents({});
        }
    }, [uid]);

    //fetch planned meals from backend and convert to object keyed by date for easier access in the calendar
    async function fetchPlannedMeals() {
        try {
            // make API call to fetch planned meals for the user
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/plannedMeals?userID=${uid}`); // expected response format: [{ id, name, date, time }, ...]
            const events = await res.json();  // expected format: [{ id, name, date, time }, ...]
            // convert array of events to an object keyed by date for easier access in the calendar
            const eventsObj = {}; 
            events.forEach(ev => {  
                if (!eventsObj[ev.date]) eventsObj[ev.date] = [];   // initialize array for the date if it doesn't exist
                eventsObj[ev.date].push(ev);  // add event to the corresponding date key
            });
            setPlannerEvents(eventsObj);
            // set counter to total number of events
            setEventCounter(events.length);
        } catch (error) {
            console.error('Failed to fetch planned meals:', error);
        }
    }

    //save planned meals to backend (called whenever events are added/edited/deleted)
    async function saveEventsToBackend(eventsObj) {
        if (uid === 'none') return;
        // convert events object back to array format for backend API ({ userID, events: [{ id, name, date, time }, ...] })
        const events = [];
        Object.keys(eventsObj).forEach(date => { 
            eventsObj[date].forEach(ev => events.push(ev)); // flatten events into a single array
        });
        // make API call to save planned meals for the user
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
        return d.toISOString().split('T')[0]; // YYYY-MM-DD format for consistent date keys
    }

    //generate calendar grid for current plannerDate (always starts on Sunday and has 42 cells to cover all month lengths and starting weekdays)
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

    //open modal to add a new event on the selected date (dateKey is in YYYY-MM-DD format)
    function openAddEventModal(dateKey) {
        setIsEditingEvent(false);
        setEditingEventId(null);
        setEditingDateKey(dateKey);
        setModalEventDate(dateKey);
        setModalEventName('');
        setModalEventTime('12:00');
        setEventModalOpen(true);
    }
    
    // open modal to edit an existing event (pre-fills fields with event data)
    function openEditEventModal(dateKey, event) {
        setIsEditingEvent(true);
        setEditingEventId(event.id);
        setEditingDateKey(dateKey);
        setModalEventDate(dateKey);
        setModalEventName(event.name);
        setModalEventTime(event.time);
        setEventModalOpen(true);
    }

    //close the add/edit event modal and reset related state
    function closeEventModal() {
        setEventModalOpen(false);
        setIsEditingEvent(false);
        setEditingEventId(null);
    }

    //save event handler (handles both adding new events and editing existing ones)
    function saveEvent() {
        if (!modalEventName.trim()) { // require event name
          return;
        }

        // Check if creating a new event and counter is at limit
        if (!isEditingEvent && eventCounter >= maxEvents) {
          setLimitNotificationOpen(true);
          return;
        }

        const dateKey = modalEventDate; // use the date from the modal (allows changing the date when editing an event)

        // If editing an existing event and the date has changed, we need to move the event to the new date key
        if (isEditingEvent && editingEventId) {
          // Remove the event from the old date key and add it to the new date key
          setPlannerEvents(prev => {
            const existing = prev[editingDateKey] || [];
            const updatedEvents = existing.filter(ev => ev.id !== editingEventId);  
            const movedEvent = {
              id: editingEventId,
              name: modalEventName.trim(),
              date: dateKey,
              time: modalEventTime,
            };
            // Create the next state by removing the event from the old date and adding it to the new date
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
        // If adding a new event or editing an existing event without changing the date, we can simply add/update the event in the current date key
        } else {
          const event = {
            id: `${dateKey}-${Date.now()}`,
            name: modalEventName.trim(),
            date: dateKey,
            time: modalEventTime,
          };

          // Add the new event to the corresponding date key in the plannerEvents state and save the updated events to the backend
          setPlannerEvents(prev => {
            const existing = prev[dateKey] || [];
            const nextState = {
              ...prev,
              [dateKey]: [...existing, event],
            };
            saveEventsToBackend(nextState);
            return nextState;
          });
          // increment counter when creating a new event
          setEventCounter(prev => prev + 1);
        }

        closeEventModal();
    }

    //delete a single event (only available when editing an existing event)
    function deleteEvent() {
        if (!isEditingEvent || !editingEventId) {
          return;
        }

        // Remove the event from the current date key
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
        // decrement counter when deleting an event
        setEventCounter(prev => Math.max(0, prev - 1));

        closeEventModal();
    }

    //delete all events that are before today or have passed the current time on today (past events)
    function deleteAllPastEvents() {
        const currentTime = new Date();
        const currentHours = String(currentTime.getHours()).padStart(2, '0');
        const currentMinutes = String(currentTime.getMinutes()).padStart(2, '0');
        const currentTimeString = `${currentHours}:${currentMinutes}`;
        
        let deletedCount = 0;
        const nextState = {};
        Object.keys(plannerEvents).forEach(dateKey => {
          if (dateKey < todayKey) {
            // Delete all events from past dates
            deletedCount += plannerEvents[dateKey].length;
          } else if (dateKey === todayKey) {
            // For today, only keep events that haven't passed
            const futureEvents = plannerEvents[dateKey].filter(ev => ev.time > currentTimeString);
            deletedCount += plannerEvents[dateKey].length - futureEvents.length;
            if (futureEvents.length > 0) {
              nextState[dateKey] = futureEvents;
            }
          } else {
            // Keep all future events
            nextState[dateKey] = plannerEvents[dateKey];
          }
        });
        
        setPlannerEvents(nextState);
        saveEventsToBackend(nextState);
        // Decrement counter by the number of deleted events
        setEventCounter(prevCount => Math.max(0, prevCount - deletedCount));
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

          {limitNotificationOpen && (
            <div style={modalOverlayStyle} onClick={() => setLimitNotificationOpen(false)}>
              <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '22px' }}>Limit Reached</h2>
                  </div>
                  <button
                    onClick={() => setLimitNotificationOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#bbb', fontSize: '18px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ color: '#f5f5f5', marginBottom: '20px', fontSize: '15px' }}>You have reached the limit of meal plans you can make. Please delete all past plans</p>
                <Button onClick={() => setLimitNotificationOpen(false)} style={{ width: '100%' }}>OK</Button>
              </div>
            </div>
          )}

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


