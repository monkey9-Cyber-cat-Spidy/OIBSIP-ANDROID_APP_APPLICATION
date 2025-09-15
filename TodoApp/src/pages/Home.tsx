import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCheckbox,
  IonList,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonButtons,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonAlert,
  IonText
} from '@ionic/react';
import { add, trash, close, logOut, calendar, document, checkboxOutline, person } from 'ionicons/icons';
import LoginPage from './LoginPage';
import { DatabaseService, User as DbUser, Task as DbTask, Event as DbEvent, Note as DbNote } from '../services/DatabaseService';
import './Home.css';

// Use database interfaces directly
type User = DbUser;
type Task = DbTask;
type Event = DbEvent;
type Note = DbNote;

type ItemType = 'tasks' | 'events' | 'notes';

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSegment, setActiveSegment] = useState<ItemType>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState<string | undefined>(undefined);
  const [newEventDate, setNewEventDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const dbService = new DatabaseService();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user, activeSegment]);

  const initializeApp = async () => {
    await dbService.initializeDatabase();
    checkAuthenticationStatus();
  };

  const checkAuthenticationStatus = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      switch (activeSegment) {
        case 'tasks':
          const userTasks = await dbService.getUserTasks(user.id!);
          setTasks(userTasks);
          break;
        case 'events':
          const userEvents = await dbService.getUserEvents(user.id!);
          setEvents(userEvents);
          break;
        case 'notes':
          const userNotes = await dbService.getUserNotes(user.id!);
          setNotes(userNotes);
          break;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    showToastMessage('Welcome back!');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    setTasks([]);
    setEvents([]);
    setNotes([]);
    setShowLogoutAlert(false);
    showToastMessage('Logged out successfully');
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
    setNewDueDate(undefined);
    setNewEventDate('');
    setNewLocation('');
    setNewNoteContent('');
  };

  const handleAddItem = async () => {
    if (!user) return;

    try {
      switch (activeSegment) {
        case 'tasks':
          if (newTitle.trim()) {
            await dbService.createTask({
              user_id: user.id!,
              title: newTitle.trim(),
              description: newDescription.trim(),
              priority: newPriority,
              due_date: newDueDate,
              completed: false
            });
            showToastMessage('Task added successfully!');
          }
          break;
        case 'events':
          if (newTitle.trim() && newEventDate) {
            await dbService.createEvent({
              user_id: user.id!,
              title: newTitle.trim(),
              description: newDescription.trim(),
              event_date: newEventDate,
              location: newLocation.trim()
            });
            showToastMessage('Event added successfully!');
          }
          break;
        case 'notes':
          if (newTitle.trim()) {
            await dbService.createNote({
              user_id: user.id!,
              title: newTitle.trim(),
              content: newNoteContent.trim()
            });
            showToastMessage('Note added successfully!');
          }
          break;
      }
      resetForm();
      setIsModalOpen(false);
      loadUserData();
    } catch (error) {
      console.error('Error adding item:', error);
      showToastMessage('Error adding item. Please try again.');
    }
  };

  const toggleTask = async (taskId: number) => {
    try {
      await dbService.toggleTask(taskId);
      loadUserData();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      switch (activeSegment) {
        case 'tasks':
          await dbService.deleteTask(id);
          break;
        case 'events':
          await dbService.deleteEvent(id);
          break;
        case 'notes':
          await dbService.deleteNote(id);
          break;
      }
      loadUserData();
      showToastMessage(`${activeSegment.slice(0, -1)} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  };

  const renderTaskItem = (task: Task) => (
    <IonCard key={task.id} className={`item-card ${task.completed ? 'completed' : ''}`}>
      <IonCardContent>
        <div className="item-header">
          <div className="item-title-section">
            <IonCheckbox
              checked={task.completed}
              onIonChange={() => toggleTask(task.id!)}
              className="task-checkbox"
            />
            <div className="item-content">
              <h3 className={task.completed ? 'completed-text' : ''}>{task.title}</h3>
              {task.description && (
                <p className={`item-description ${task.completed ? 'completed-text' : ''}`}>
                  {task.description}
                </p>
              )}
              <div className="item-meta">
                <IonText color={getPriorityColor(task.priority)} className="priority-badge">
                  <small>{task.priority.toUpperCase()}</small>
                </IonText>
                {task.due_date && (
                  <IonText color="medium" className="due-date">
                    <small>Due: {formatDate(task.due_date)}</small>
                  </IonText>
                )}
                <IonText color="medium" className="created-date">
                  <small>Created: {formatDate(task.created_at!)}</small>
                </IonText>
              </div>
            </div>
          </div>
          <IonButton
            fill="clear"
            color="danger"
            onClick={() => deleteItem(task.id!)}
            className="delete-button"
          >
            <IonIcon icon={trash} />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );

  const renderEventItem = (event: Event) => (
    <IonCard key={event.id} className="item-card">
      <IonCardContent>
        <div className="item-header">
          <div className="item-content">
            <h3>{event.title}</h3>
            {event.description && (
              <p className="item-description">{event.description}</p>
            )}
            <div className="item-meta">
              <IonText color="primary" className="event-date">
                <small>
                  <IonIcon icon={calendar} /> {formatDate(event.event_date)}
                </small>
              </IonText>
              {event.location && (
                <IonText color="medium" className="event-location">
                  <small>📍 {event.location}</small>
                </IonText>
              )}
              <IonText color="medium" className="created-date">
                <small>Created: {formatDate(event.created_at!)}</small>
              </IonText>
            </div>
          </div>
          <IonButton
            fill="clear"
            color="danger"
            onClick={() => deleteItem(event.id!)}
            className="delete-button"
          >
            <IonIcon icon={trash} />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );

  const renderNoteItem = (note: Note) => (
    <IonCard key={note.id} className="item-card">
      <IonCardContent>
        <div className="item-header">
          <div className="item-content">
            <h3>{note.title}</h3>
            {note.content && (
              <p className="note-content">{note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}</p>
            )}
            <div className="item-meta">
              <IonText color="medium" className="created-date">
                <small>Created: {formatDate(note.created_at!)}</small>
              </IonText>
            </div>
          </div>
          <IonButton
            fill="clear"
            color="danger"
            onClick={() => deleteItem(note.id!)}
            className="delete-button"
          >
            <IonIcon icon={trash} />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );

  const renderAddModal = () => {
    const getModalTitle = () => {
      switch (activeSegment) {
        case 'tasks': return 'Add Task';
        case 'events': return 'Add Event';
        case 'notes': return 'Add Note';
        default: return 'Add Item';
      }
    };

    return (
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{getModalTitle()}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsModalOpen(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          <div className="form-container">
            {/* Common Title Field */}
            <IonItem>
              <IonLabel position="stacked">Title *</IonLabel>
              <IonInput
                value={newTitle}
                placeholder={`Enter ${activeSegment.slice(0, -1)} title`}
                onIonInput={(e) => setNewTitle(e.detail.value!)}
                clearInput
              />
            </IonItem>

            {/* Description Field for Tasks and Events */}
            {activeSegment !== 'notes' && (
              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={newDescription}
                  placeholder="Enter description"
                  onIonInput={(e) => setNewDescription(e.detail.value!)}
                  rows={3}
                />
              </IonItem>
            )}

            {/* Task-specific fields */}
            {activeSegment === 'tasks' && (
              <>
                <IonItem>
                  <IonLabel position="stacked">Priority</IonLabel>
                  <IonSelect
                    value={newPriority}
                    placeholder="Select priority"
                    onIonChange={(e) => setNewPriority(e.detail.value)}
                  >
                    <IonSelectOption value="low">Low</IonSelectOption>
                    <IonSelectOption value="medium">Medium</IonSelectOption>
                    <IonSelectOption value="high">High</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Due Date (Optional)</IonLabel>
                  <IonDatetime
                    value={newDueDate}
                    onIonChange={(e) => setNewDueDate(e.detail.value as string)}
                    presentation="date-time"
                    min={new Date().toISOString()}
                  />
                </IonItem>
              </>
            )}

            {/* Event-specific fields */}
            {activeSegment === 'events' && (
              <>
                <IonItem>
                  <IonLabel position="stacked">Event Date & Time *</IonLabel>
                  <IonDatetime
                    value={newEventDate}
                    onIonChange={(e) => setNewEventDate(e.detail.value as string)}
                    presentation="date-time"
                    min={new Date().toISOString()}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Location</IonLabel>
                  <IonInput
                    value={newLocation}
                    placeholder="Enter location"
                    onIonInput={(e) => setNewLocation(e.detail.value!)}
                    clearInput
                  />
                </IonItem>
              </>
            )}

            {/* Note-specific field */}
            {activeSegment === 'notes' && (
              <IonItem>
                <IonLabel position="stacked">Content</IonLabel>
                <IonTextarea
                  value={newNoteContent}
                  placeholder="Write your note here..."
                  onIonInput={(e) => setNewNoteContent(e.detail.value!)}
                  rows={8}
                  autoGrow
                />
              </IonItem>
            )}

            <IonButton
              expand="block"
              onClick={handleAddItem}
              disabled={!newTitle.trim() || (activeSegment === 'events' && !newEventDate)}
              className="add-button"
            >
              <IonIcon icon={add} slot="start" />
              Add {activeSegment.slice(0, -1)}
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    );
  };

  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (activeSegment) {
        case 'tasks': return { title: 'No tasks yet!', message: 'Create your first task to get organized.' };
        case 'events': return { title: 'No events scheduled!', message: 'Add an event to keep track of your schedule.' };
        case 'notes': return { title: 'No notes yet!', message: 'Capture your thoughts and ideas here.' };
        default: return { title: 'Nothing here!', message: 'Start by adding some items.' };
      }
    };

    const empty = getEmptyMessage();
    const getIcon = () => {
      switch (activeSegment) {
        case 'tasks': return checkboxOutline;
        case 'events': return calendar;
        case 'notes': return document;
        default: return add;
      }
    };

    return (
      <div className="empty-state">
        <IonIcon icon={getIcon()} className="empty-icon" />
        <h2>{empty.title}</h2>
        <p>{empty.message}</p>
        <IonButton
          fill="outline"
          onClick={() => setIsModalOpen(true)}
          className="empty-action-button"
        >
          <IonIcon icon={add} slot="start" />
          Add {activeSegment.slice(0, -1)}
        </IonButton>
      </div>
    );
  };

  const getCurrentItems = () => {
    switch (activeSegment) {
      case 'tasks': return tasks;
      case 'events': return events;
      case 'notes': return notes;
      default: return [];
    }
  };

  const renderCurrentItems = () => {
    switch (activeSegment) {
      case 'tasks': return tasks.map(renderTaskItem);
      case 'events': return events.map(renderEventItem);
      case 'notes': return notes.map(renderNoteItem);
      default: return [];
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Todo Keeper</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setShowLogoutAlert(true)}>
              <IonIcon icon={person} />
              <IonText className="user-greeting">{user?.username}</IonText>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Todo Keeper</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="content-container">
          {/* Segment Navigation */}
          <IonSegment
            value={activeSegment}
            onIonChange={(e) => setActiveSegment(e.detail.value as ItemType)}
            className="main-segment"
          >
            <IonSegmentButton value="tasks">
              <IonIcon icon={checkboxOutline} />
              <IonLabel>Tasks</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="events">
              <IonIcon icon={calendar} />
              <IonLabel>Events</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="notes">
              <IonIcon icon={document} />
              <IonLabel>Notes</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {/* Content Area */}
          <div className="items-container">
            {getCurrentItems().length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="items-list">
                {renderCurrentItems()}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Add Item Modal */}
        {renderAddModal()}

        {/* Logout Confirmation */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Logout"
          message={`Are you sure you want to logout, ${user?.username}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Logout',
              handler: handleLogout
            }
          ]}
        />

        {/* Toast Notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
