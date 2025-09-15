// Optional: Add to DatabaseService.ts for backup functionality

async exportUserData(userId: number): Promise<any> {
  try {
    const userData = {
      user: await this.getUserById(userId),
      tasks: await this.getUserTasks(userId),
      events: await this.getUserEvents(userId),
      notes: await this.getUserNotes(userId),
      exportDate: new Date().toISOString()
    };
    
    return userData;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

async importUserData(userData: any): Promise<void> {
  try {
    // Restore user data from backup
    for (const task of userData.tasks) {
      await this.createTask(task);
    }
    for (const event of userData.events) {
      await this.createEvent(event);
    }
    for (const note of userData.notes) {
      await this.createNote(note);
    }
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Usage in component:
const handleBackup = async () => {
  const backup = await dbService.exportUserData(user.id);
  const blob = new Blob([JSON.stringify(backup, null, 2)], 
    { type: 'application/json' });
  
  // Download backup file
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todokeeper-backup-${Date.now()}.json`;
  a.click();
};