# I. Managing secrets deployment in Kubernetes using Sealed Secrets
- SealedSecretはBitnamiが開発するOSSです。
- いわゆるCRD（Custom Resource Definition）で、クラスター内ではこのCRDを管理するSealedSecret Controllerを稼働させます。
- SealedSecretは公開鍵暗号を使用します。
- コントローラーが秘密鍵を持ちます。
- ユーザーは公開鍵を使ってSecretを暗号化してSealdSecretをリソースを作成します。
- SealdSecretリソースをクラスター内に作成すると、コントローラーがSealdSecretを復号し、Secretを作成します。

- 参考: https://qiita.com/sotoiwa/items/3cd9ba7b7175ce9c71be

## 1. Install sealed-secrets by helm
- `helm install --namespace kube-system my-release stable/sealed-secrets`

## 2. Install kubeseal
- `brew install kubeseal`

## 3. Create public key mycert.pem
- コントローラーが秘密鍵を持ちます。
    ```
    kubeseal \
    --controller-name=my-release-sealed-secrets \
    --controller-namespace=kube-system \
    --fetch-cert > mycert.pem
    ```

## 4. encrypt secret.yaml by mycert.pem
- ユーザーは公開鍵を使ってSecretを暗号化してSealdSecretをリソースを作成します。
- `kubeseal --format=yaml --cert=mycert.pem < secret.yaml > sealedsecret.yaml`
 
## 5. Deploy sealedsecret
- `kubectl apply -f sealedsecret.yaml`
- SealdSecretリソースをクラスター内に作成すると、コントローラーがSealdSecretを復号し、Secretを作成します。

## 6. Deploy 確認
- `kubectl get sealedsecret -n kube-system`
- `kubectl get secret -n kube-system`

# II. KAMUS
## 1. HELMレポ追加とKAMUS設定
- `helm repo add soluto https://charts.soluto.io`
- `helm upgrade --install kamus soluto/kamus`

## 2. KAMUS-CLI設定
- `npm install -g @soluto-asurion/kamus-cli`

export POD_NAME=$(kubectl get pods --namespace default -l "app=kamus,release=kamus,component=encryptor" -o jsonpath="{.items[0].metadata.name}")
echo "Visit http://127.0.0.1:8080 to use your application"
kubectl port-forward $POD_NAME 8080:9999

kamus-cli encrypt \
    --secret super-secret \
    --service-account kamus-sa \
    --namespace default \
    --kamus-url http://localhost:8080 --allow-insecure-url