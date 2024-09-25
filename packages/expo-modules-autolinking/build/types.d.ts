import { ExpoModuleConfig } from './ExpoModuleConfig';
export type SupportedPlatform = 'apple' | 'ios' | 'android' | 'web' | 'macos' | 'tvos' | 'devtools';
/**
 * Options that can be passed through `expo.autolinking` config in the package.json file.
 */
export type AutolinkingOptions = {
    searchPaths?: string[] | null;
    ignorePaths?: string[] | null;
    exclude?: string[] | null;
    flags?: Record<string, any>;
} & {
    [key in SupportedPlatform]?: AutolinkingOptions;
};
export interface SearchOptions {
    searchPaths: string[];
    ignorePaths?: string[] | null;
    exclude?: string[] | null;
    platform: SupportedPlatform;
    silent?: boolean;
    nativeModulesDir?: string | null;
    projectRoot: string;
    /**
     * Filter the search results to only include the project dependencies.
     * In a monorepo, you may like to set this to false and link all modules from the monorepo.
     * @default true
     */
    onlyProjectDeps?: boolean;
    flags?: Record<string, any>;
}
export interface ResolveOptions extends SearchOptions {
    json?: boolean;
}
export interface GenerateOptions extends ResolveOptions {
    target: string;
    namespace?: string;
    empty?: boolean;
}
export interface GenerateModulesProviderOptions extends ResolveOptions {
    target: string;
    entitlement?: string;
    packages: string[];
}
export interface PatchReactImportsOptions {
    podsRoot: string;
    dryRun: boolean;
}
export type PackageRevision = {
    path: string;
    version: string;
    config?: ExpoModuleConfig;
    duplicates?: PackageRevision[];
};
export type SearchResults = {
    [moduleName: string]: PackageRevision;
};
export interface ModuleAndroidProjectInfo {
    name: string;
    sourceDir: string;
}
export interface ModuleAndroidPluginInfo {
    id: string;
    sourceDir: string;
}
export interface ModuleAndroidAarProjectInfo extends AndroidGradleAarProjectDescriptor {
    projectDir: string;
}
export interface ModuleDescriptorAndroid {
    packageName: string;
    projects: ModuleAndroidProjectInfo[];
    plugins?: ModuleAndroidPluginInfo[];
    modules: string[];
    aarProjects?: ModuleAndroidAarProjectInfo[];
}
export interface ModuleIosPodspecInfo {
    podName: string;
    podspecDir: string;
}
export interface ModuleDescriptorIos {
    packageName: string;
    pods: ModuleIosPodspecInfo[];
    flags: Record<string, any> | undefined;
    swiftModuleNames: string[];
    modules: string[];
    appDelegateSubscribers: string[];
    reactDelegateHandlers: string[];
    debugOnly: boolean;
}
export interface ModuleDescriptorDevTools {
    packageName: string;
    packageRoot: string;
    webpageRoot: string;
}
export type ModuleDescriptor = ModuleDescriptorAndroid | ModuleDescriptorIos | ModuleDescriptorDevTools;
export interface AndroidGradlePluginDescriptor {
    /**
     * Gradle plugin ID
     */
    id: string;
    /**
     * Artifact group
     */
    group: string;
    /**
     * Relative path to the gradle plugin directory
     */
    sourceDir: string;
}
export interface AndroidGradleAarProjectDescriptor {
    /**
     * Gradle project name
     */
    name: string;
    /**
     * Path to the AAR file
     */
    aarFilePath: string;
}
/**
 * Represents a raw config specific to Apple platforms.
 */
export type RawModuleConfigApple = {
    /**
     * Names of Swift native modules classes to put to the generated modules provider file.
     */
    modules?: string[];
    /**
     * Names of Swift native modules classes to put to the generated modules provider file.
     * @deprecated Deprecated in favor of `modules`. Might be removed in the future releases.
     */
    modulesClassNames?: string[];
    /**
     * Names of Swift classes that hooks into `ExpoAppDelegate` to receive AppDelegate life-cycle events.
     */
    appDelegateSubscribers?: string[];
    /**
     * Names of Swift classes that implement `ExpoReactDelegateHandler` to hook React instance creation.
     */
    reactDelegateHandlers?: string[];
    /**
     * Podspec relative path.
     * To have multiple podspecs, string array type is also supported.
     */
    podspecPath?: string | string[];
    /**
     * Swift product module name. If empty, the pod name is used for Swift imports.
     * To have multiple modules, string array is also supported.
     */
    swiftModuleName?: string | string[];
    /**
     * Whether this module will be added only to the debug configuration.
     * Defaults to false.
     */
    debugOnly?: boolean;
};
/**
 * Represents a raw config from `expo-module.json`.
 */
export interface RawExpoModuleConfig {
    /**
     * An array of supported platforms.
     */
    platforms?: SupportedPlatform[];
    /**
     * A config for all Apple platforms.
     */
    apple?: RawModuleConfigApple;
    /**
     * The legacy config previously used for iOS platform. For backwards compatibility it's used as the fallback for `apple`.
     * Also due to backwards compatibility, it includes the deprecated `modulesClassNames` field.
     * @deprecated As the module can now support more than iOS platform, use the generic `apple` config instead.
     */
    ios?: RawModuleConfigApple;
    /**
     * Android-specific config.
     */
    android?: {
        /**
         * Full names (package + class name) of Kotlin native modules classes to put to the generated package provider file.
         */
        modules?: string[];
        /**
         * Full names (package + class name) of Kotlin native modules classes to put to the generated package provider file.
         * @deprecated Deprecated in favor of `modules`. Might be removed in the future releases.
         */
        modulesClassNames?: string[];
        /**
         * build.gradle relative path.
         * To have multiple build.gradle projects, string array type is also supported.
         */
        gradlePath?: string | string[];
        /**
         * Gradle plugins.
         */
        gradlePlugins?: AndroidGradlePluginDescriptor[];
        /**
         * Gradle projects containing AAR files.
         */
        gradleAarProjects?: AndroidGradleAarProjectDescriptor[];
    };
    /**
     * DevTools-specific config.
     */
    devtools?: {
        /**
         * The webpage root directory for Expo CLI DevTools to serve the web resources.
         */
        webpageRoot: string;
    };
}
interface AndroidMavenRepositoryPasswordCredentials {
    username: string;
    password: string;
}
interface AndroidMavenRepositoryHttpHeaderCredentials {
    name: string;
    value: string;
}
interface AndroidMavenRepositoryAWSCredentials {
    accessKey: string;
    secretKey: string;
    sessionToken?: string;
}
type AndroidMavenRepositoryCredentials = AndroidMavenRepositoryPasswordCredentials | AndroidMavenRepositoryHttpHeaderCredentials | AndroidMavenRepositoryAWSCredentials;
export interface AndroidMavenRepository {
    /**
     * The URL of the Maven repository.
     */
    url: string;
    /**
     * The credentials to use when accessing the Maven repository.
     * May be of type PasswordCredentials, HttpHeaderCredentials, or AWSCredentials.
     *
     * @see the authentication schemes section of [Gradle documentation](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:authentication_schemes) for more information.
     */
    credentials?: AndroidMavenRepositoryCredentials;
    /**
     * The authentication scheme to use when accessing the Maven repository.
     */
    authentication?: 'basic' | 'digest' | 'header';
}
interface ApplePod {
    name: string;
    version?: string;
    configurations?: string[];
    modular_headers?: boolean;
    source?: string;
    path?: string;
    podspec?: string;
    testspecs?: string[];
    git?: string;
    branch?: string;
    tag?: string;
    commit?: string;
}
export type ExtraDependencies = AndroidMavenRepository[] | ApplePod[];
/**
 * Represents code signing entitlements passed to the `ExpoModulesProvider` for Apple platforms.
 */
export interface AppleCodeSignEntitlements {
    /**
     * @see https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups
     */
    appGroups?: string[];
}
export {};
