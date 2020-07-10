# I. kustomize設定
- `brew install kustomize`

# II. kustomizeテンプレート作成
    ```
    [ec2-user@ip-172-31-15-114 ArgoCD-Kustomize]$ tree .
    .
    ├── base
    │   ├── deployment.yaml
    │   ├── gateway.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   └── service.yaml
    └── overlays
        ├── kustomization.yaml
        └── replica-and-rollout-strategy.yaml
    ```

## kustomization.yamlにデプロイメントを定義
- 例：kustomizeでデプロイ
- デプロイ内容確認
    - `cd overlays`
    - `kustomize build .`

- デプロイ
    - `kubectl apply -k .`