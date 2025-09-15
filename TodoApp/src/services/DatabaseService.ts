import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  created_at?: string;
}

export interface Task {
  id?: number;
  user_id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed: boolean;
  created_at?: string;
}

export interface Event {
  id?: number;
  user_id: number;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  created_at?: string;
}

export interface Note {
  id?: number;
  user_id: number;
  title: string;
  content: string;
  created_at?: string;
}

export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly dbName = 'todoapp.db';
  private readonly dbVersion = 1;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDatabase(): Promise<void> {
    try {
      console.log('Initializing database...');
      
      // Check if platform supports SQLite
      const platform = Capacitor.getPlatform();
      console.log('Platform detected:', platform);
      
      if (platform === 'web') {
        console.log('Web platform - using localStorage fallback');
        this.setupLocalStorageFallback();
        return;
      }

      // Add timeout for SQLite operations
      const dbInitPromise = this.initSQLiteDatabase();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database initialization timeout')), 10000)
      );

      await Promise.race([dbInitPromise, timeoutPromise]);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      console.log('Falling back to localStorage');
      // Always fallback to localStorage on any error
      this.setupLocalStorageFallback();
    }
  }

  private async initSQLiteDatabase(): Promise<void> {
    try {
      // Create connection with error handling
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        this.dbVersion,
        false
      );

      if (!this.db) {
        throw new Error('Failed to create SQLite connection');
      }

      await this.db.open();
      await this.createTables();
      console.log('SQLite database ready');
    } catch (error) {
      console.error('SQLite initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        due_date DATETIME,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        event_date DATETIME NOT NULL,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const query of queries) {
      await this.db.execute(query);
    }
  }

  private setupLocalStorageFallback(): void {
    console.log('Setting up localStorage fallback...');
    
    // Initialize localStorage-based storage
    if (!localStorage.getItem('todoapp_users')) {
      // Create demo user in localStorage
      const demoUser = {
        id: 1,
        username: 'demo',
        email: 'demo@todoapp.com',
        password_hash: this.hashPassword('demo123'),
        created_at: new Date().toISOString()
      };
      localStorage.setItem('todoapp_users', JSON.stringify([demoUser]));
      console.log('Demo user created in localStorage');
    }
    if (!localStorage.getItem('todoapp_tasks')) {
      localStorage.setItem('todoapp_tasks', JSON.stringify([]));
    }
    if (!localStorage.getItem('todoapp_events')) {
      localStorage.setItem('todoapp_events', JSON.stringify([]));
    }
    if (!localStorage.getItem('todoapp_notes')) {
      localStorage.setItem('todoapp_notes', JSON.stringify([]));
    }
    console.log('localStorage fallback initialized');
  }

  // Hash password (simple implementation - in production use bcrypt)
  private hashPassword(password: string): string {
    // Simple hash implementation - replace with bcrypt in production
    return btoa(password + 'salt_key_2024');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // User authentication methods
  async createUser(username: string, email: string, password: string): Promise<User | null> {
    try {
      const password_hash = this.hashPassword(password);
      
      if (this.db) {
        const result = await this.db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, password_hash]
        );
        
        if (result.changes && result.changes.lastId) {
          return {
            id: result.changes.lastId,
            username,
            email,
            password_hash,
            created_at: new Date().toISOString()
          };
        }
      } else {
        // LocalStorage fallback
        const users = JSON.parse(localStorage.getItem('todoapp_users') || '[]');
        const newUser: User = {
          id: Date.now(),
          username,
          email,
          password_hash,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('todoapp_users', JSON.stringify(users));
        return newUser;
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
    return null;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      console.log('Authenticating user:', username);
      
      if (this.db) {
        console.log('Using SQLite database for authentication');
        const result = await this.db.query(
          'SELECT * FROM users WHERE username = ? OR email = ?',
          [username, username]
        );
        
        console.log('Query result:', result);
        if (result.values && result.values.length > 0) {
          const user = result.values[0] as User;
          console.log('User found, verifying password');
          if (this.verifyPassword(password, user.password_hash)) {
            console.log('Password verified successfully');
            return user;
          } else {
            console.log('Password verification failed');
          }
        } else {
          console.log('No user found with that username/email');
        }
      } else {
        console.log('Using localStorage fallback for authentication');
        // LocalStorage fallback
        const users = JSON.parse(localStorage.getItem('todoapp_users') || '[]');
        console.log('Users in localStorage:', users.length);
        
        const user = users.find((u: User) => 
          (u.username === username || u.email === username) &&
          this.verifyPassword(password, u.password_hash)
        );
        
        if (user) {
          console.log('User authenticated via localStorage');
          return user;
        } else {
          console.log('Authentication failed - user not found in localStorage');
        }
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
    }
    return null;
  }

  async checkUserExists(username: string, email: string): Promise<boolean> {
    try {
      if (this.db) {
        const result = await this.db.query(
          'SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?',
          [username, email]
        );
        return result.values ? result.values[0].count > 0 : false;
      } else {
        const users = JSON.parse(localStorage.getItem('todoapp_users') || '[]');
        return users.some((u: User) => u.username === username || u.email === email);
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Task methods
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> {
    try {
      if (this.db) {
        const result = await this.db.run(
          'INSERT INTO tasks (user_id, title, description, priority, due_date, completed) VALUES (?, ?, ?, ?, ?, ?)',
          [task.user_id, task.title, task.description, task.priority, task.due_date || null, task.completed ? 1 : 0]
        );
        
        if (result.changes && result.changes.lastId) {
          return { ...task, id: result.changes.lastId, created_at: new Date().toISOString() };
        }
      } else {
        const tasks = JSON.parse(localStorage.getItem('todoapp_tasks') || '[]');
        const newTask: Task = {
          ...task,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        tasks.push(newTask);
        localStorage.setItem('todoapp_tasks', JSON.stringify(tasks));
        return newTask;
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
    return null;
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    try {
      if (this.db) {
        const result = await this.db.query(
          'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return result.values || [];
      } else {
        const tasks = JSON.parse(localStorage.getItem('todoapp_tasks') || '[]');
        return tasks.filter((task: Task) => task.user_id === userId)
                   .sort((a: Task, b: Task) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
      }
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return [];
    }
  }

  async toggleTask(taskId: number): Promise<boolean> {
    try {
      if (this.db) {
        const result = await this.db.run(
          'UPDATE tasks SET completed = NOT completed WHERE id = ?',
          [taskId]
        );
        return !!(result.changes && (result.changes as any).changes > 0);
      } else {
        const tasks = JSON.parse(localStorage.getItem('todoapp_tasks') || '[]');
        const taskIndex = tasks.findIndex((task: Task) => task.id === taskId);
        if (taskIndex !== -1) {
          tasks[taskIndex].completed = !tasks[taskIndex].completed;
          localStorage.setItem('todoapp_tasks', JSON.stringify(tasks));
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
    return false;
  }

  async deleteTask(taskId: number): Promise<boolean> {
    try {
      if (this.db) {
        const result = await this.db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
        return !!(result.changes && (result.changes as any).changes > 0);
      } else {
        const tasks = JSON.parse(localStorage.getItem('todoapp_tasks') || '[]');
        const filteredTasks = tasks.filter((task: Task) => task.id !== taskId);
        localStorage.setItem('todoapp_tasks', JSON.stringify(filteredTasks));
        return filteredTasks.length !== tasks.length;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Event methods
  async createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> {
    try {
      if (this.db) {
        const result = await this.db.run(
          'INSERT INTO events (user_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)',
          [event.user_id, event.title, event.description, event.event_date, event.location || null]
        );
        
        if (result.changes && result.changes.lastId) {
          return { ...event, id: result.changes.lastId, created_at: new Date().toISOString() };
        }
      } else {
        const events = JSON.parse(localStorage.getItem('todoapp_events') || '[]');
        const newEvent: Event = {
          ...event,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        events.push(newEvent);
        localStorage.setItem('todoapp_events', JSON.stringify(events));
        return newEvent;
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
    return null;
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    try {
      if (this.db) {
        const result = await this.db.query(
          'SELECT * FROM events WHERE user_id = ? ORDER BY event_date ASC',
          [userId]
        );
        return result.values || [];
      } else {
        const events = JSON.parse(localStorage.getItem('todoapp_events') || '[]');
        return events.filter((event: Event) => event.user_id === userId)
                    .sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      }
    } catch (error) {
      console.error('Error getting user events:', error);
      return [];
    }
  }

  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      if (this.db) {
        const result = await this.db.run('DELETE FROM events WHERE id = ?', [eventId]);
        return !!(result.changes && (result.changes as any).changes > 0);
      } else {
        const events = JSON.parse(localStorage.getItem('todoapp_events') || '[]');
        const filteredEvents = events.filter((event: Event) => event.id !== eventId);
        localStorage.setItem('todoapp_events', JSON.stringify(filteredEvents));
        return filteredEvents.length !== events.length;
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Note methods
  async createNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note | null> {
    try {
      if (this.db) {
        const result = await this.db.run(
          'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
          [note.user_id, note.title, note.content]
        );
        
        if (result.changes && result.changes.lastId) {
          return { ...note, id: result.changes.lastId, created_at: new Date().toISOString() };
        }
      } else {
        const notes = JSON.parse(localStorage.getItem('todoapp_notes') || '[]');
        const newNote: Note = {
          ...note,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        notes.push(newNote);
        localStorage.setItem('todoapp_notes', JSON.stringify(notes));
        return newNote;
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
    return null;
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    try {
      if (this.db) {
        const result = await this.db.query(
          'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return result.values || [];
      } else {
        const notes = JSON.parse(localStorage.getItem('todoapp_notes') || '[]');
        return notes.filter((note: Note) => note.user_id === userId)
                   .sort((a: Note, b: Note) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
      }
    } catch (error) {
      console.error('Error getting user notes:', error);
      return [];
    }
  }

  async deleteNote(noteId: number): Promise<boolean> {
    try {
      if (this.db) {
        const result = await this.db.run('DELETE FROM notes WHERE id = ?', [noteId]);
        return !!(result.changes && (result.changes as any).changes > 0);
      } else {
        const notes = JSON.parse(localStorage.getItem('todoapp_notes') || '[]');
        const filteredNotes = notes.filter((note: Note) => note.id !== noteId);
        localStorage.setItem('todoapp_notes', JSON.stringify(filteredNotes));
        return filteredNotes.length !== notes.length;
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}