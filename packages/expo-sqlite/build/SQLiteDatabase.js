import * as FS from 'expo-file-system';
import ExpoSQLite from './ExpoSQLiteNext';
import { SQLiteStatement, } from './SQLiteStatement';
/**
 * A SQLite database.
 */
export class SQLiteDatabase {
    databaseName;
    directory;
    options;
    nativeDatabase;
    constructor(databaseName, directory, options, nativeDatabase) {
        this.databaseName = databaseName;
        this.directory = directory;
        this.options = options;
        this.nativeDatabase = nativeDatabase;
    }
    /**
     * Asynchronous call to return whether the database is currently in a transaction.
     */
    isInTransactionAsync() {
        return this.nativeDatabase.isInTransactionAsync();
    }
    /**
     * Close the database.
     */
    closeAsync() {
        return this.nativeDatabase.closeAsync();
    }
    /**
     * Execute all SQL queries in the supplied string.
     * > Note: The queries are not escaped for you! Be careful when constructing your queries.
     *
     * @param source A string containing all the SQL queries.
     */
    execAsync(source) {
        return this.nativeDatabase.execAsync(source);
    }
    /**
     * [Serialize the database](https://sqlite.org/c3ref/serialize.html) as `Uint8Array`.
     *
     * @param databaseName The name of the current attached databases. The default value is `main` which is the default database name.
     */
    serializeAsync(databaseName = 'main') {
        return this.nativeDatabase.serializeAsync(databaseName);
    }
    /**
     * Create a [prepared SQLite statement](https://www.sqlite.org/c3ref/prepare.html).
     *
     * @param source A string containing the SQL query.
     */
    async prepareAsync(source) {
        const nativeStatement = new ExpoSQLite.NativeStatement();
        await this.nativeDatabase.prepareAsync(nativeStatement, source);
        return new SQLiteStatement(this.nativeDatabase, nativeStatement);
    }
    /**
     * Execute a transaction and automatically commit/rollback based on the `task` result.
     *
     * > **Note:** This transaction is not exclusive and can be interrupted by other async queries.
     * @example
     * ```ts
     * db.withTransactionAsync(async () => {
     *   await db.execAsync('UPDATE test SET name = "aaa"');
     *
     *   //
     *   // We cannot control the order of async/await order, so order of execution is not guaranteed.
     *   // The following UPDATE query out of transaction may be executed here and break the expectation.
     *   //
     *
     *   const result = await db.getFirstAsync<{ name: string }>('SELECT name FROM Users');
     *   expect(result?.name).toBe('aaa');
     * });
     * db.execAsync('UPDATE test SET name = "bbb"');
     * ```
     * If you worry about the order of execution, use `withExclusiveTransactionAsync` instead.
     *
     * @param task An async function to execute within a transaction.
     */
    async withTransactionAsync(task) {
        try {
            await this.execAsync('BEGIN');
            await task();
            await this.execAsync('COMMIT');
        }
        catch (e) {
            await this.execAsync('ROLLBACK');
            throw e;
        }
    }
    /**
     * Execute a transaction and automatically commit/rollback based on the `task` result.
     *
     * The transaction may be exclusive.
     * As long as the transaction is converted into a write transaction,
     * the other async write queries will abort with `database is locked` error.
     *
     * @param task An async function to execute within a transaction. Any queries inside the transaction must be executed on the `txn` object.
     * The `txn` object has the same interfaces as the [`SQLiteDatabase`](#sqlitedatabase) object. You can use `txn` like a [`SQLiteDatabase`](#sqlitedatabase) object.
     *
     * @example
     * ```ts
     * db.withExclusiveTransactionAsync(async (txn) => {
     *   await txn.execAsync('UPDATE test SET name = "aaa"');
     * });
     * ```
     */
    async withExclusiveTransactionAsync(task) {
        const transaction = await Transaction.createAsync(this);
        let error;
        try {
            await transaction.execAsync('BEGIN');
            await task(transaction);
            await transaction.execAsync('COMMIT');
        }
        catch (e) {
            await transaction.execAsync('ROLLBACK');
            error = e;
        }
        finally {
            await transaction.closeAsync();
        }
        if (error) {
            throw error;
        }
    }
    /**
     * Synchronous call to return whether the database is currently in a transaction.
     */
    isInTransactionSync() {
        return this.nativeDatabase.isInTransactionSync();
    }
    /**
     * Close the database.
     */
    closeSync() {
        return this.nativeDatabase.closeSync();
    }
    /**
     * Execute all SQL queries in the supplied string.
     *
     * > **Note:** The queries are not escaped for you! Be careful when constructing your queries.
     *
     * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
     *
     * @param source A string containing all the SQL queries.
     */
    execSync(source) {
        return this.nativeDatabase.execSync(source);
    }
    /**
     * [Serialize the database](https://sqlite.org/c3ref/serialize.html) as `Uint8Array`.
     *
     * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
     *
     * @param databaseName The name of the current attached databases. The default value is `main` which is the default database name.
     */
    serializeSync(databaseName = 'main') {
        return this.nativeDatabase.serializeSync(databaseName);
    }
    /**
     * Create a [prepared SQLite statement](https://www.sqlite.org/c3ref/prepare.html).
     *
     * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
     *
     * @param source A string containing the SQL query.
     */
    prepareSync(source) {
        const nativeStatement = new ExpoSQLite.NativeStatement();
        this.nativeDatabase.prepareSync(nativeStatement, source);
        return new SQLiteStatement(this.nativeDatabase, nativeStatement);
    }
    /**
     * Execute a transaction and automatically commit/rollback based on the `task` result.
     *
     * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
     *
     * @param task An async function to execute within a transaction.
     */
    withTransactionSync(task) {
        try {
            this.execSync('BEGIN');
            task();
            this.execSync('COMMIT');
        }
        catch (e) {
            this.execSync('ROLLBACK');
            throw e;
        }
    }
    async runAsync(source, ...params) {
        const statement = await this.prepareAsync(source);
        let result;
        try {
            result = await statement.executeAsync(...params);
        }
        finally {
            await statement.finalizeAsync();
        }
        return result;
    }
    async getFirstAsync(source, ...params) {
        const statement = await this.prepareAsync(source);
        let firstRow;
        try {
            const result = await statement.executeAsync(...params);
            firstRow = await result.getFirstAsync();
        }
        finally {
            await statement.finalizeAsync();
        }
        return firstRow;
    }
    async *getEachAsync(source, ...params) {
        const statement = await this.prepareAsync(source);
        try {
            const result = await statement.executeAsync(...params);
            for await (const row of result) {
                yield row;
            }
        }
        finally {
            await statement.finalizeAsync();
        }
    }
    async getAllAsync(source, ...params) {
        const statement = await this.prepareAsync(source);
        let allRows;
        try {
            const result = await statement.executeAsync(...params);
            allRows = await result.getAllAsync();
        }
        finally {
            await statement.finalizeAsync();
        }
        return allRows;
    }
    runSync(source, ...params) {
        const statement = this.prepareSync(source);
        let result;
        try {
            result = statement.executeSync(...params);
        }
        finally {
            statement.finalizeSync();
        }
        return result;
    }
    getFirstSync(source, ...params) {
        const statement = this.prepareSync(source);
        let firstRow;
        try {
            const result = statement.executeSync(...params);
            firstRow = result.getFirstSync();
        }
        finally {
            statement.finalizeSync();
        }
        return firstRow;
    }
    *getEachSync(source, ...params) {
        const statement = this.prepareSync(source);
        try {
            const result = statement.executeSync(...params);
            for (const row of result) {
                yield row;
            }
        }
        finally {
            statement.finalizeSync();
        }
    }
    getAllSync(source, ...params) {
        const statement = this.prepareSync(source);
        let allRows;
        try {
            const result = statement.executeSync(...params);
            allRows = result.getAllSync();
        }
        finally {
            statement.finalizeSync();
        }
        return allRows;
    }
}
/**
 * The default directory for SQLite databases.
 */
export const defaultDatabaseDirectory = FS.documentDirectory + 'SQLite';
/**
 * Open a database.
 *
 * @param databaseName The name of the database file to open.
 * @param options Open options.
 * @param directory The directory where the database file is located. The default value is `defaultDatabaseDirectory`.
 */
export async function openDatabaseAsync(databaseName, options, directory) {
    const openOptions = options ?? {};
    const resolvedDirectory = directory ?? defaultDatabaseDirectory;
    await ExpoSQLite.ensureHasAccessAsync(databaseName, resolvedDirectory);
    const nativeDatabase = new ExpoSQLite.NativeDatabase(databaseName, resolvedDirectory, openOptions);
    await nativeDatabase.initAsync();
    return new SQLiteDatabase(databaseName, resolvedDirectory, openOptions, nativeDatabase);
}
/**
 * Open a database.
 *
 * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
 *
 * @param databaseName The name of the database file to open.
 * @param options Open options.
 * @param directory The directory where the database file is located. The default value is `defaultDatabaseDirectory`.
 */
export function openDatabaseSync(databaseName, options, directory) {
    const openOptions = options ?? {};
    const resolvedDirectory = directory ?? defaultDatabaseDirectory;
    ExpoSQLite.ensureHasAccessSync(databaseName, resolvedDirectory);
    const nativeDatabase = new ExpoSQLite.NativeDatabase(databaseName, resolvedDirectory, openOptions);
    nativeDatabase.initSync();
    return new SQLiteDatabase(databaseName, resolvedDirectory, openOptions, nativeDatabase);
}
/**
 * Given a `Uint8Array` data and [deserialize to memory database](https://sqlite.org/c3ref/deserialize.html).
 *
 * @param serializedData The binary array to deserialize from [`SQLiteDatabase.serializeAsync()`](#serializeasyncdatabasename).
 * @param options Open options.
 */
export async function deserializeDatabaseAsync(serializedData, options) {
    const openOptions = options ?? {};
    const nativeDatabase = new ExpoSQLite.NativeDatabase(':memory:', undefined, openOptions, serializedData);
    await nativeDatabase.initAsync();
    return new SQLiteDatabase(':memory:', undefined, openOptions, nativeDatabase);
}
/**
 * Given a `Uint8Array` data and [deserialize to memory database](https://sqlite.org/c3ref/deserialize.html).
 *
 * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
 *
 * @param serializedData The binary array to deserialize from [`SQLiteDatabase.serializeSync()`](#serializesyncdatabasename)
 * @param options Open options.
 */
export function deserializeDatabaseSync(serializedData, options) {
    const openOptions = options ?? {};
    const nativeDatabase = new ExpoSQLite.NativeDatabase(':memory:', undefined, openOptions, serializedData);
    nativeDatabase.initSync();
    return new SQLiteDatabase(':memory:', undefined, openOptions, nativeDatabase);
}
/**
 * Delete a database file.
 *
 * @param databaseName The name of the database file to delete.
 * @param directory The directory where the database file is located. The default value is `defaultDatabaseDirectory`.
 */
export async function deleteDatabaseAsync(databaseName, directory) {
    const resolvedDirectory = directory ?? defaultDatabaseDirectory;
    return await ExpoSQLite.deleteDatabaseAsync(databaseName, resolvedDirectory);
}
/**
 * Delete a database file.
 *
 * > **Note:** Running heavy tasks with this function can block the JavaScript thread and affect performance.
 *
 * @param databaseName The name of the database file to delete.
 * @param directory The directory where the database file is located. The default value is `defaultDatabaseDirectory`.
 */
export function deleteDatabaseSync(databaseName, directory) {
    const resolvedDirectory = directory ?? defaultDatabaseDirectory;
    return ExpoSQLite.deleteDatabaseSync(databaseName, resolvedDirectory);
}
/**
 * Add a listener for database changes.
 * > Note: to enable this feature, you must set [`enableChangeListener` to `true`](#sqliteopenoptions) when opening the database.
 *
 * @param listener A function that receives the `databaseName`, `databaseFilePath`, `tableName` and `rowId` of the modified data.
 * @returns A `Subscription` object that you can call `remove()` on when you would like to unsubscribe the listener.
 */
export function addDatabaseChangeListener(listener) {
    return ExpoSQLite.addListener('onDatabaseChange', listener);
}
/**
 * A new connection specific used for [`withExclusiveTransactionAsync`](#withexclusivetransactionasynctask).
 * @hidden not going to pull all the database methods to the document.
 */
class Transaction extends SQLiteDatabase {
    static async createAsync(db) {
        const options = { ...db.options, useNewConnection: true };
        if (db.directory) {
            await ExpoSQLite.ensureHasAccessAsync(db.databaseName, db.directory);
        }
        const nativeDatabase = new ExpoSQLite.NativeDatabase(db.databaseName, db.directory, options);
        await nativeDatabase.initAsync();
        return new Transaction(db.databaseName, db.directory, options, nativeDatabase);
    }
}
//# sourceMappingURL=SQLiteDatabase.js.map