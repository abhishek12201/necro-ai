'use client';

import { useState } from 'react';
import CodeComparison from '@/components/CodeComparison';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code2 } from 'lucide-react';

// Sample code examples
const examples = {
  jquery: {
    original: `// jQuery AJAX call
$.ajax({
  url: '/api/users',
  type: 'GET',
  success: function(data) {
    $('#user-list').html('');
    data.forEach(function(user) {
      $('#user-list').append(
        '<li>' + user.name + '</li>'
      );
    });
  },
  error: function(xhr, status, error) {
    alert('Error: ' + error);
  }
});`,
    modern: `// Modern fetch with async/await
async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    data.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      userList.appendChild(li);
    });
  } catch (error) {
    console.error('Error:', error);
    alert(\`Error: \${error.message}\`);
  }
}`,
    originalLang: 'javascript',
    modernLang: 'javascript',
    title: 'jQuery → Modern JavaScript',
  },
  react: {
    original: `// Class component with lifecycle
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true
    };
  }

  componentDidMount() {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        this.setState({
          users: data,
          loading: false
        });
      });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }

    return (
      <ul>
        {this.state.users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }
}`,
    modern: `// Functional component with hooks
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    }
    
    loadUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`,
    originalLang: 'javascript',
    modernLang: 'javascript',
    title: 'React Class → Hooks',
  },
  php: {
    original: `<?php
// Legacy PHP with mysql_* functions
$conn = mysql_connect('localhost', 'user', 'pass');
mysql_select_db('mydb', $conn);

$user_id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $user_id;
$result = mysql_query($query);

if ($result) {
  while ($row = mysql_fetch_assoc($result)) {
    echo "<p>" . $row['name'] . "</p>";
  }
  mysql_free_result($result);
}

mysql_close($conn);
?>`,
    modern: `<?php
// Modern PHP with PDO
try {
  $pdo = new PDO(
    'mysql:host=localhost;dbname=mydb',
    'user',
    'pass',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  $user_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
  
  $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
  $stmt->execute(['id' => $user_id]);
  
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "<p>" . htmlspecialchars($row['name']) . "</p>";
  }
} catch (PDOException $e) {
  error_log($e->getMessage());
  echo "An error occurred";
}
?>`,
    originalLang: 'php',
    modernLang: 'php',
    title: 'PHP mysql_* → PDO',
  },
  callback: {
    original: `// Callback hell
function processUser(userId, callback) {
  getUser(userId, function(err, user) {
    if (err) return callback(err);
    
    getOrders(user.id, function(err, orders) {
      if (err) return callback(err);
      
      getOrderDetails(orders[0].id, function(err, details) {
        if (err) return callback(err);
        
        updateInventory(details, function(err, result) {
          if (err) return callback(err);
          callback(null, result);
        });
      });
    });
  });
}`,
    modern: `// Async/await
async function processUser(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    const result = await updateInventory(details);
    
    return result;
  } catch (error) {
    console.error('Error processing user:', error);
    throw error;
  }
}`,
    originalLang: 'javascript',
    modernLang: 'javascript',
    title: 'Callbacks → Async/Await',
  },
};

export default function CodeComparisonPage() {
  const [selectedExample, setSelectedExample] = useState<keyof typeof examples>('jquery');

  const example = examples[selectedExample];

  return (
    <div className="min-h-screen bg-necro-dark text-white">
      {/* Header */}
      <header className="border-b border-necro-green/20 bg-necro-darker/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-necro-green to-necro-purple bg-clip-text text-transparent">
              NECRO AI
            </div>
            <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30">
              Code Comparison
            </Badge>
          </div>
          <Button
            variant="outline"
            className="border-necro-green/30 text-necro-green hover:bg-necro-green/10"
            onClick={() => (window.location.href = '/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Example Selector */}
        <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-6 h-6 text-necro-green" />
            <h2 className="text-2xl font-bold text-white">Select Example</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(examples).map(([key, ex]) => (
              <Button
                key={key}
                variant={selectedExample === key ? 'default' : 'outline'}
                onClick={() => setSelectedExample(key as keyof typeof examples)}
                className={
                  selectedExample === key
                    ? 'bg-necro-green text-necro-darker hover:bg-necro-green/90'
                    : 'border-necro-green/30 text-necro-green hover:bg-necro-green/10'
                }
              >
                {ex.title}
              </Button>
            ))}
          </div>
        </Card>

        {/* Code Comparison */}
        <CodeComparison
          originalCode={example.original}
          modernCode={example.modern}
          originalLanguage={example.originalLang}
          modernLanguage={example.modernLang}
          originalTitle="Legacy Code"
          modernTitle="Modern Code"
        />

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-4">About This Comparison</h3>
          <div className="space-y-3 text-gray-300">
            {selectedExample === 'jquery' && (
              <>
                <p>
                  <strong className="text-necro-green">Legacy:</strong> jQuery AJAX with callbacks and DOM manipulation
                </p>
                <p>
                  <strong className="text-necro-green">Modern:</strong> Native fetch API with async/await and modern DOM methods
                </p>
                <p className="text-sm text-gray-400">
                  Benefits: No jQuery dependency, better error handling, cleaner syntax, native browser support
                </p>
              </>
            )}
            {selectedExample === 'react' && (
              <>
                <p>
                  <strong className="text-necro-green">Legacy:</strong> React class component with lifecycle methods
                </p>
                <p>
                  <strong className="text-necro-green">Modern:</strong> Functional component with hooks (useState, useEffect)
                </p>
                <p className="text-sm text-gray-400">
                  Benefits: Less boilerplate, easier to understand, better code reuse, improved performance
                </p>
              </>
            )}
            {selectedExample === 'php' && (
              <>
                <p>
                  <strong className="text-necro-green">Legacy:</strong> Deprecated mysql_* functions with SQL injection vulnerability
                </p>
                <p>
                  <strong className="text-necro-green">Modern:</strong> PDO with prepared statements and proper error handling
                </p>
                <p className="text-sm text-gray-400">
                  Benefits: SQL injection protection, better error handling, object-oriented, supports multiple databases
                </p>
              </>
            )}
            {selectedExample === 'callback' && (
              <>
                <p>
                  <strong className="text-necro-green">Legacy:</strong> Nested callbacks creating "callback hell"
                </p>
                <p>
                  <strong className="text-necro-green">Modern:</strong> Async/await for sequential asynchronous operations
                </p>
                <p className="text-sm text-gray-400">
                  Benefits: Cleaner syntax, easier to read and maintain, better error handling, avoids callback hell
                </p>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
