
{ pkgs, ... }:

{
  # Pinned version of the nixpkgs that ensures that this flake builds
  # identically on all machines.
  #
  # To learn how to update the version, see:
  # https://devenv.sh/guides/using-a-specific-nixpkgs-commit/
  nixpkgs = "github:NixOS/nixpkgs/nixos-23.11";

  # Devenv shell, available by running `devenv shell`.
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
  ];

  # This is the entrypoint for the Devbox environment.
  entrypoint = "pnpm install";

  # The set of files that will be included in the Devbox environment.
  include = [
    "*"
    ".env*"
  ];

  # The set of files that will be ignored in the Devbox environment.
  exclude = [
    "node_modules"
    ".direnv"
  ];

  # Preview environment, available via a URL when this environment is running.
  previews = [
    {
      port = 3000;
      # When the port is open, run this command.
      command = "pnpm dev";
    }
  ];
}
