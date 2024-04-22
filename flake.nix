{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    utils.url = "github:numtide/flake-utils";
    utils.inputs.nixpkgs.follows = "nixpkgs";
  };
  outputs = { self, nixpkgs, utils }: utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs { inherit system; };
      nodePkgs = with pkgs.nodePackages; [
        bash-language-server
        eslint
        pnpm
        prettier
        stylelint
        typescript
        typescript-language-server
        vscode-langservers-extracted
        yaml-language-server
        yarn
      ];
    in
    {
      devShell = pkgs.mkShell {
        # buildInputs = with pkgs; [
        # ];
        packages = with pkgs; [
          bun
          deno
          marksman
          nodejs_20
        ] ++ nodePkgs;
      };
    }
  );
}
