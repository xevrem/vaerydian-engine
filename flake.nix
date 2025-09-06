{
  inputs = {
    utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, utils }: utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs { inherit system; };
      nodePkgs = with pkgs.nodePackages; [
        bash-language-server
        eslint
        prettier
        stylelint
        typescript
        typescript-language-server
        vscode-langservers-extracted
        yaml-language-server
      ];
    in
    {
      devShell = pkgs.mkShell {
        # buildInputs = with pkgs; [
        # ];
        packages = with pkgs; [
          marksman
          nodejs_22
        ] ++ nodePkgs;
      };
    }
  );
}
