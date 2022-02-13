if ./generate-ca.sh ; then
	if node ./make-did-web.js ; then  
		./organize-data.sh 
	else
		echo "Error making did:web"
	fi
else
	echo "Error generating CAs for example"
fi
