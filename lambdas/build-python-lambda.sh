aws ecr create-repository --repository-name $ECR_REPOSITORY | echo "repo already created" 
export ECR_REPOSITORY=$ECR_REPOSITORY
docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG . 
echo "Pushing image to ECR..."
docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"