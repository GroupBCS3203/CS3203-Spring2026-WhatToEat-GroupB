import { useState } from 'react';


export function MealPlanner(){
    const todayKey = new Date().toISOString().split('T')[0];
    const [plannerEvents, setPlannerEvents] = useState({});
    const [plannerDate, setPlannerDate] = useState(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        d.setDate(1);
        return d;
    });
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [newPlannerEventDate, setNewPlannerEventDate] = useState(todayKey);
    const [newPlannerEventName, setNewPlannerEventName] = useState('');
    const [newPlannerEventTime, setNewPlannerEventTime] = useState('12:00');

    // Format date as YYYY-MM-DD for planner dates.
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
    
      function handleAddPlannerEvent() {
        if (!newPlannerEventName.trim()) {
          return;
        }
    
        const dateKey = newPlannerEventDate;
        const event = {
          id: `${dateKey}-${Date.now()}`,
          name: newPlannerEventName.trim(),
          time: newPlannerEventTime,
        };
    
        setPlannerEvents(prev => {
          const existing = prev[dateKey] || [];
          return {
            ...prev,
            [dateKey]: [...existing, event],
          };
        });
    
        setIsAddEventOpen(false);
        setNewPlannerEventName('');
        setNewPlannerEventTime('12:00');
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

    return (
        <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button onClick={prevMonth}>◀</Button>
              <strong style={{ color: '#ffffff', fontSize: '18px' }}>{plannerDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
              <Button onClick={nextMonth}>▶</Button>
            </div>

            <Button onClick={() => setIsAddEventOpen(prev => !prev)}>
              {isAddEventOpen ? 'Close Event' : 'Create Event'}
            </Button>
          </div>

          {isAddEventOpen && (
            <div className="planner-event-form" style={{ marginBottom: '12px', background: '#1b1b1b', padding: '12px', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ color: '#fff', fontSize: '14px' }}>
                  Event Date
                  <input
                    type="date"
                    value={newPlannerEventDate}
                    onChange={e => setNewPlannerEventDate(e.target.value)}
                    style={{ marginLeft: '4px', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  />
                </label>

                <label style={{ color: '#fff', fontSize: '14px' }}>
                  Food name
                  <input
                    type="text"
                    placeholder="Food name"
                    value={newPlannerEventName}
                    onChange={e => setNewPlannerEventName(e.target.value)}
                    style={{ marginLeft: '4px', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  />
                </label>

                <label style={{ color: '#fff', fontSize: '14px' }}>
                  Time
                  <input
                    type="time"
                    value={newPlannerEventTime}
                    onChange={e => setNewPlannerEventTime(e.target.value)}
                    style={{ marginLeft: '4px', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  />
                </label>

                <Button onClick={handleAddPlannerEvent}>Save</Button>
              </div>
            </div>
          )}

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
                    padding: '5px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setIsAddEventOpen(true);
                    setNewPlannerEventDate(dayKey);
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{date.getDate()}</div>
                  {events.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{ fontSize: '11px', marginBottom: '2px', textAlign: 'left' }}>
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
        </>
        )
}


