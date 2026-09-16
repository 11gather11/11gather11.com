{
  description = "11gather11.com";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];

      perSystem =
        { pkgs, ... }:
        let
          # Shared by local development and CI so both resolve the same Node.js and pnpm.
          baseInputs = with pkgs; [
            nodejs_24
            pnpm_12
            gitleaks
            typos
          ];
        in
        {
          devShells = {
            ci = pkgs.mkShellNoCC {
              packages = baseInputs;
            };

            # Kept apart from `ci` so check jobs do not download wrangler and workerd.
            deploy = pkgs.mkShellNoCC {
              packages = baseInputs ++ [ pkgs.wrangler ];
            };

            default = pkgs.mkShellNoCC {
              packages =
                baseInputs
                ++ (with pkgs; [
                  gh
                  wrangler
                ]);

              # pnpm records the lockfile it installed in node_modules/.pnpm/lock.yaml,
              # so a missing or older copy means node_modules is out of date.
              shellHook = ''
                if [ -f pnpm-lock.yaml ] && { [ ! -f node_modules/.pnpm/lock.yaml ] || [ pnpm-lock.yaml -nt node_modules/.pnpm/lock.yaml ]; }; then
                  echo "📦 Installing dependencies..."
                  pnpm install --frozen-lockfile
                fi
              '';
            };
          };

          formatter = pkgs.nixfmt;
        };
    };
}
