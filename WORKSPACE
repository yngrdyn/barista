# The nodejs rules
RULES_NODEJS_VERSION = "2.0.0"
RULES_NODEJS_SHA256 = "5bf77cc2d13ddf9124f4c1453dd96063774d755d4fc75d922471540d1c9a8ea8"
# Rules for compiling sass
RULES_SASS_VERSION = "1.26.3"
RULES_SASS_SHA256 = "9dcfba04e4af896626f4760d866f895ea4291bc30bf7287887cefcf4707b6a62"
# Bazel toolchain needed for remote execution
BAZEL_TOOLCHAIN_VERSION = "3.2.0"
BAZEL_TOOLCHAIN_SHA256 = "db48eed61552e25d36fe051a65d2a329cc0fb08442627e8f13960c5ab087a44e"

workspace(
    name = "dynatrace",
    managed_directories = {"@npm": ["node_modules"]},
)

# These rules are built-into Bazel but we need to load them first to download more rules
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")


http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = RULES_NODEJS_SHA256,
    url = "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/rules_nodejs-%s.tar.gz" % (RULES_NODEJS_VERSION, RULES_NODEJS_VERSION),
)

http_archive(
    name = "io_bazel_rules_sass",
    sha256 = RULES_SASS_SHA256,
    strip_prefix = "rules_sass-%s" % RULES_SASS_VERSION,
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/%s.zip" % RULES_SASS_VERSION,
        "https://mirror.bazel.build/github.com/bazelbuild/rules_sass/archive/%s.zip" % RULES_SASS_VERSION,
    ],
)

###########################################
# Npm Install and Typescript Sass support #
###########################################
load("@build_bazel_rules_nodejs//:index.bzl", "check_bazel_version", "npm_install")
# The minimum bazel version to use with this repo is v3.1.0.
check_bazel_version("3.1.0")
# Install all dependencies with npm
npm_install(
    name = "npm",
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
    symlink_node_modules = True,
)

# Install the @angular/bazel package into @npm_angular_bazel
# Note, this will probably break in a future rules_nodejs release.
# It causes all builds to fetch npm packages even if not needed (eg. only building go code)
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies(suppress_warning = True)

# Setup the rules_sass toolchain
load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")

sass_repositories()
# Fetch required transitive dependencies. This is an optional step because you
# can always fetch the required NodeJS transitive dependency on your own.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")

rules_sass_dependencies()

################################
# Support for Remote Execution #
################################

http_archive(
    name = "bazel_toolchains",
    sha256 = BAZEL_TOOLCHAIN_SHA256,
    strip_prefix = "bazel-toolchains-%s" % BAZEL_TOOLCHAIN_VERSION,
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/releases/download/%s/bazel-toolchains-%s.tar.gz" % (BAZEL_TOOLCHAIN_VERSION, BAZEL_TOOLCHAIN_VERSION),
        "https://github.com/bazelbuild/bazel-toolchains/releases/download/%s/bazel-toolchains-%s.tar.gz" % (BAZEL_TOOLCHAIN_VERSION, BAZEL_TOOLCHAIN_VERSION),
    ],
)
