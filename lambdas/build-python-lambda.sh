aws ecr create-repository --repository-name $ECR_REPOSITORY | echo "repo already created" 
docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG . --build-arg var_name=$ECR_REPOSITORY
echo "Pushing image to ECR..."
docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"