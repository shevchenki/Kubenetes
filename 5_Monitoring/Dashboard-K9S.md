# I. K8S管理するため、K9S使用
## Install Brew
- `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`
- `sudo yum groupinstall 'Development Tools'`
- `eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)`
- `sudo yum groupinstall 'Development Tools'`
- `echo 'eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)' >> /home/ec2-user/.bash_profile`
- `eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)`
- `brew install gcc`

## Install K9S
- `brew install derailed/k9s/k9s`

## Run K9S
- `k9s`
![](./K9S.png)

# II. K8S管理するため、DashBoard使用
## 1. Download Dashboard-v2-beta8.yaml
- `curl https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recommended.yaml  > dashboard-v2-beta8.yaml`

## 3.1 Dashboard-v2-beta8.yaml内容変更
### Secretを無効にする
  ```
  # apiVersion: v1
  # kind: Secret
  # metadata:
  #   labels:
  #     k8s-app: kubernetes-dashboard
  #   name: kubernetes-dashboard-certs
  #   namespace: kubernetes-dashboard
  # type: Opaque
  ```

### ServiceTypeをLoadBalanceに変更
  ```
  kind: Service
  apiVersion: v1
  metadata:
    labels:
      k8s-app: kubernetes-dashboard
    name: kubernetes-dashboard
    namespace: kubernetes-dashboard
  spec:
    # Add Type to LoadBlancer
    type: LoadBalancer
    ports:
      - port: 443
        targetPort: 8443
    selector:
      k8s-app: kubernetes-dashboard
  ```

## 4. Apply manifest
- `kubectl apply -f dashboard-v2-beta8.yaml`

## 5. kubernetes-dashboard-certs作成、SSL認証:
  ```
  sudo mkdir certs
  sudo chmod 777 certs
  openssl req -nodes -newkey rsa:2048 -keyout certs/dashboard.key -out certs/dashboard.csr -subj "/C=/ST=/L=/O=/OU=/CN=kubernetes-dashboard"
  openssl x509 -req -sha256 -days 365 -in certs/dashboard.csr -signkey certs/dashboard.key -out certs/dashboard.crt
  sudo chmod -R 777 certs
  ```

- `kubectl create secret generic kubernetes-dashboard-certs --from-file=certs -n kubernetes-dashboard`

## 6. 結果確認
  ```
  [ec2-user@ip-172-31-1-83 Dashboard]$ kubectl get pod -ANAMESPACE              NAME                                         READY   STATUS    RESTARTS   AGE
  default                dynamodb                                     1/1     Running   0          4h24m
  default                frontend                                     1/1     Running   0          4h23m
  kube-system            aws-node-chs7k                               1/1     Running   0          4h28m
  kube-system            coredns-6bbf8649bc-gwc9c                     1/1     Running   0          5h4m
  kube-system            coredns-6bbf8649bc-ht6w5                     1/1     Running   0          5h4m
  kube-system            kube-proxy-dvf9z                             1/1     Running   0          4h28m
  kube-system            metrics-server-7668599459-np4qb              1/1     Running   0          96m
  kubernetes-dashboard   dashboard-metrics-scraper-6c554969c6-9dnzk   1/1     Running   0          22m
  kubernetes-dashboard   kubernetes-dashboard-56c5f95c6b-tshdw        1/1     Running   0          22m

  [ec2-user@ip-172-31-1-83 Dashboard]$ kubectl get svc -ANAMESPACE              NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP                                                                   PORT(S)         AGE
  default                kubernetes                  ClusterIP      10.100.0.1       <none>                                                                        443/TCP         5h5m
  kube-system            kube-dns                    ClusterIP      10.100.0.10      <none>                                                                        53/UDP,53/TCP   5h5m
  kube-system            metrics-server              ClusterIP      10.100.14.67     <none>                                                                        443/TCP         97m
  kubernetes-dashboard   dashboard-metrics-scraper   ClusterIP      10.100.192.188   <none>                                                                        8000/TCP        23m
  kubernetes-dashboard   kubernetes-dashboard        LoadBalancer   10.100.200.97    a0671339217644c0e880467f9b3fc6c2-897863935.ap-northeast-1.elb.amazonaws.com   443:30625/TCP   23m
  ```

## 7. ログインTokken取得
### admin-user.yaml作成
  ```
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: admin-user
    namespace: kubernetes-dashboard

  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
    name: admin-user
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: cluster-admin
  subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard
  ```
### apply admin-user.yaml
`kubectl apply -f admin-user.yaml`

### Tokken取得
`kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')`
  ```
  [ec2-user@ip-172-31-1-83 Dashboard]$ kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
  Name:         admin-user-token-rj7kh
  Namespace:    kubernetes-dashboard
  Labels:       <none>
  Annotations:  kubernetes.io/service-account.name: admin-user
                kubernetes.io/service-account.uid: e7a9562f-8a7e-469a-9efe-377c27d33842

  Type:  kubernetes.io/service-account-token

  Data
  ====
  ca.crt:     1025 bytes
  namespace:  20 bytes
  token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLXJqN2toIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJlN2E5NTYyZi04YTdlLTQ2OWEtOWVmZS0zNzdjMjdkMzM4NDIiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.NE-fbE0QMgYv0oS60usDZpXjrAOCXSWniZ4c7zaU4c3cmXsYD3DijLUbAPmu9R4-Dr6EtmtkPXnohn82QuFm9svqbU5DddLghmh5uZPpGVIGfWI3u6WkjEUSsI6o8d4Xi9GeyQzwOo4_9ikI4wBI5qCikwqxd1JNbTmytgo0SWe2p9CG2HkgALEc8XAtJIz6NcELGMDKKRvua6GVb0MUa5GK0kstEbTQB8UaHGRKvZKEdmebsKL32gpaRzcgRevp-WFMSH3mUiZoJCBfIh5xuJsecyEf9uP7gAGNJo40kE2ttaAJTwnaJgo-oD6nK3iJxo-IStYtVcJ9jlQcD2fUDA
  ```

## 8. get kubernetes-dashboard
`kubectl get po -n kubernetes-dashboard`
  ```
  [ec2-user@ip-172-31-1-83 Dashboard]$ kubectl get po -n kubernetes-dashboard
  NAME                                         READY   STATUS    RESTARTS   AGE
  dashboard-metrics-scraper-6c554969c6-9dnzk   1/1     Running   0          26m
  kubernetes-dashboard-56c5f95c6b-tshdw        1/1     Running   0          26m
  ```

### secret確認 
`kubectl get secret -n kubernetes-dashboard`
  ```
  [ec2-user@ip-172-31-1-83 Dashboard]$ kubectl get secret -n kubernetes-dashboard
  NAME                               TYPE                                  DATA   AGE
  admin-user-token-rj7kh             kubernetes.io/service-account-token   3      17m
  default-token-jh6qh                kubernetes.io/service-account-token   3      26m
  kubernetes-dashboard-certs         Opaque                                3      24m
  kubernetes-dashboard-csrf          Opaque                                1      26m
  kubernetes-dashboard-key-holder    Opaque                                2      26m
  kubernetes-dashboard-token-59s6m   kubernetes.io/service-account-token   3      26m
  ```

## Dashboard表示
- DashBoardにログインするため、上記のService名にHTTPSを使用する
- `https://a0671339217644c0e880467f9b3fc6c2-1854472879.ap-northeast-1.elb.amazonaws.com`
- Tokkenを選んで、上記のTokkenを使用する
![](./Tokken入力.png)
- DashBoard:
![](./DashBoard.png)


# III. AWS手順の通り、DashBoard使用
## 1. DashBoard設定
- `kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recommended.yaml`

## 2. eks-admin.yaml作成
  ```
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: eks-admin
    namespace: kube-system
  ---
  apiVersion: rbac.authorization.k8s.io/v1beta1
  kind: ClusterRoleBinding
  metadata:
    name: eks-admin
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: cluster-admin
  subjects:
  - kind: ServiceAccount
    name: eks-admin
    namespace: kube-system
  ```

### Deploy eks-admin.yaml
- `kubectl apply -f eks-admin.yaml`

## 3. Token取得
  ```
  [ec2-user@ip-172-31-15-114 Dashboard]$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')
  Name:         eks-admin-token-b2mrg
  Namespace:    kube-system
  Labels:       <none>
  Annotations:  kubernetes.io/service-account.name: eks-admin
                kubernetes.io/service-account.uid: b312d433-ba55-4080-8a81-8fb05ef7d85a

  Type:  kubernetes.io/service-account-token

  Data
  ====
  ca.crt:     1025 bytes
  namespace:  11 bytes
  token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJla3MtYWRtaW4tdG9rZW4tYjJtcmciLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZWtzLWFkbWluIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiYjMxMmQ0MzMtYmE1NS00MDgwLThhODEtOGZiMDVlZjdkODVhIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmVrcy1hZG1pbiJ9.oLENStrZ5liQsVth_o1BPEzPauCa-RUbn2ByA0Kujg9R_jBPEhFooeXadt8nYcQ_8o3v3gTPMlsBDi49Vub8IDrqzqEXgEqhBmfdSxc0QiRGRinMpyDsJyxdgBNw7rRir6ZAz6zKPApBs1UTM5Qn0XyxM79ETTECbJdrMQuXupb72QXLI50E7lGE2HMe6AOhLc9PEL8Pqz7xuDyGgiRzEh6P3p_9nlIHP60p2Ixa-geqhLz5cwBhuEULQSR5gHh7-vVbhOGoxwZAksu5oYqkqEgHkJ6QBwM9IdzYqyQbdd9Ow14wUnHPhjKRBjISyNPOV9YRlvX0rz6Is-Mx3elIvQ
  ```
### kube-proxy起動
- `kubectl proxy`

## 4. Set up port-forward at local
- `ssh -i "key.pem" ec2-user@aa.aa.aaa.aaa -L 8001:127.0.0.1:8001`

## 5. 結果確認
- `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/cronjob?namespace=default`