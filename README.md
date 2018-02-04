# Session Manager

Firefox extension that saves the opened tabs and allows the user to restore them
later.

## Instructions:

### Saving
Open the popup and enter a name for the session in the "name" text field then click
the "save" button. All the tabs in the current window will be saved under a new
session. Tabs with an url begining with file, about, data, javascript, chrome or
moz-extension are not saved because Firefox don't allow an extension to restore them.
When the new session is stored a row with the name of the new session is shown.
If the chosen name still exits, the extension will ask if you want to overwrite
the existing session.

### Restoring
To restore an already saved session, click on the "start" button on the row of
the session to restore. A new window will appear loading all the stored tabs.

### Delete
To delete a session click the "trash" button on the row of the session to delete.
A dialog will ask for a confirmation.

### Management
You can sort your sessions by simply drag the session you want to move and dropping
it in the new position.

### Edit
Not implemented yet.

### Exporting/Importing session data
By clicking on the "option" button, the extension option page will be shown.
In this page you can export all the saved session in a JSON file.
You can also import data in the form of a JSON file. If the file don' adhere to
the correct format the import porcess will be aborted.
By importing a session file all the saved data will be overwritten by the imported
data.

