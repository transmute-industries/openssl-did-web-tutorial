if ./generate-ca.sh ; then
	if node ./make-did-web.js ; then  
		./organize-data.sh 
	else
		echo "Error making did:web"
	fi
	if node ./issue.js ; then  
		echo "issued JWT successfully"
	else
		echo "Failed to issue JWT"
	fi
	if node ./verify-jwt.js ; then  
		echo "verified JWT successfully"
	else
		echo "Failed to verify JWT"
	fi
	if ./verify-x5c.sh ; then  
		echo "verified JWT CA Chain via x5c successfully"
	else
		echo "Failed to verify JWT CA Chain via x5c"
	fi
else
	echo "Error generating CAs for example"
fi
