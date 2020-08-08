# MicroServiceの発展と共に:
- Microservice管理できるようにKubenetesを使用する(k8s)
    - K8Sをデプロイするため、オンプレミスやクラウドの基盤が使える
    - GCP、Azure、AWS ... 使える
- バージョンとデプロイを管理するため、KUBECTLやHELM、KUSTOMIZEなどを使う
- Microservice管理できるようにIstioやAWS AppMeshを使う
- Monitoringできるように、Dashboard、Grafana、Prometheus...使う
- CICD with ArgoCD

# ここではステップバイステップ実施してみます。
## [1. AWSによりElastic Kubenetes Serviceをデプロイ](1_EKS)
## [2. K8Sサンプルデプロイ](2_K8S_Sample)
## 3. HELM、Kustomizeによりリソース管理
- [3.1_HELM](3.1_HELM)
- [3.2_Kustomize](3.2_Kustomize)
## [4. Istioデプロイ(AppMesh)](4_istio)
## [5. 監視・ログ管理](5_Monitoring)
## [6. CI/CD with ArgoCD](6_ArgoCD)
## [7. Loki_logs](7_Loki_logs)
## [8. Secret management](8_Secret_management)
## [9. Istio-Traffic-Management](9_Istio-Traffic-Management)