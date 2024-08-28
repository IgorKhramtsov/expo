// Copyright 2015-present 650 Industries. All rights reserved.

import ExpoModulesCore

struct IOSOptions: Record, Equatable {
  @Field
  var appGroup: String?

  // MARK: - Equatable

  static func == (lhs: IOSOptions, rhs: IOSOptions) -> Bool {
    return lhs.appGroup == rhs.appGroup 
  }
}
