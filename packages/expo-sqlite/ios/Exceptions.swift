import ExpoModulesCore

internal class DatabaseException: Exception {
  override var code: String {
    "E_SQLITE_OPEN_DATABASE"
  }

  override var reason: String {
    "Could not open database"
  }
}

internal class DatabaseDirectoryIsNilException: Exception {
  override var code: String {
    "E_SQLITE_DIRECTORY_IS_NIL"
  }

  override var reason: String {
    "Directory should be provided for not in-memory database"
  }
}

internal class DatabaseInvalidPathException: GenericException<String> {
  override var code: String {
    "E_SQLITE_INVALID_PATH"
  }

  override var reason: String {
    "Invalid database path: \(param)"
  }
}

internal class DeleteDatabaseException: GenericException<String> {
  override var code: String {
    "E_SQLITE_DELETE_DATABASE"
  }

  override var reason: String {
    "Unable to delete database \(param) that is currently open. Close it prior to deletion"
  }
}

internal class DatabaseNotFoundException: GenericException<String> {
  override var code: String {
    "E_SQLITE_DELETE_DATABASE"
  }

  override var reason: String {
    "Database \(param) not found"
  }
}

internal class DeleteDatabaseFileException: GenericException<String> {
  override var code: String {
    "E_SQLITE_DELETE_DATABASE"
  }

  override var reason: String {
    "Unable to delete the database file for \(param) database"
  }
}

internal class InvalidSqlException: Exception {
  override var reason: String {
    "sql argument must be a string"
  }
}

internal class InvalidArgumentsException: Exception {
  override var reason: String {
    "args must be an array"
  }
}

internal class InvalidBindParameterException: Exception {
  override var reason: String {
    "Invalid bind parameter"
  }
}

internal class AccessClosedResourceException: Exception {
  override var reason: String {
    "Access to closed resource"
  }
}

internal class SQLiteErrorException: GenericException<String> {
  override var code: String {
    "ERR_INTERNAL_SQLITE_ERROR"
  }

  override var reason: String {
    "\(param)"
  }
}

internal class InvalidConvertibleException: GenericException<String> {
}
