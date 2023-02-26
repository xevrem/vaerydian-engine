(
 (typescript-mode
  . ((eval . (let ((project-directory (car (dir-locals-find-file default-directory))))
               (add-to-list 'eglot-server-programs '((js-mode typescript-mode typescript-tsx-jode js-ts-mode typescript-ts-mode tsx-ts-mode) . (".yarn/sdks/typescript/bin/tsserver" "--stdio")))
               (setq lsp-clients-typescript-server-args `("--tsserver-path" ,(concat project-directory ".yarn/sdks/typescript/bin/tsserver") "--stdio")
                     )
               )
           )
     )
  )
 )
